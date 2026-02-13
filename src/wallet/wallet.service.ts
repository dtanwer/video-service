import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction, WalletTransactionStatus, WalletTransactionType, WalletTransactionsubType } from './entities/wallet-transaction.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { User } from '../users/user.entity';
import { RazorpayPayoutService } from '../payments/services/razorpay-payout.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction)
        private transactionRepository: Repository<WalletTransaction>,
        @InjectRepository(Payout)
        private payoutRepository: Repository<Payout>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private razorpayPayoutService: RazorpayPayoutService,
        private configService: ConfigService,
        private dataSource: DataSource,
    ) { }

    async getWallet(userId: string): Promise<Wallet> {
        let wallet = await this.walletRepository.findOne({ where: { userId } });
        if (!wallet) {
            wallet = this.walletRepository.create({ userId, balance: 0, lockedBalance: 0 });
            await this.walletRepository.save(wallet);
        }
        return wallet;
    }

    async getTransactions(userId: string, page: number = 1, limit: number = 10) {
        const wallet = await this.getWallet(userId);

        const [transactions, total] = await this.transactionRepository.findAndCount({
            where: { walletId: wallet.id },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        });

        return {
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async creditWallet(userId: string, amount: number, referenceId: string, metadata?: any): Promise<WalletTransaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let wallet = await queryRunner.manager.findOne(Wallet, { where: { userId } });
            if (!wallet) {
                wallet = queryRunner.manager.create(Wallet, { userId, balance: 0, lockedBalance: 0 });
                await queryRunner.manager.save(wallet);
            }

            // Update balance
            wallet.balance = Number(wallet.balance) + Number(amount);
            await queryRunner.manager.save(wallet);

            // Create transaction record
            const transaction = queryRunner.manager.create(WalletTransaction, {
                wallet,
                walletId: wallet.id,
                type: WalletTransactionType.CREDIT,
                subType: WalletTransactionsubType.EARNING,
                amount,
                referenceId,
                status: WalletTransactionStatus.SUCCESS,
                metadata,
            });
            await queryRunner.manager.save(transaction);

            await queryRunner.commitTransaction();
            return transaction;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async requestWithdrawal(userId: string, amount: number): Promise<{ payout: Payout, transaction: WalletTransaction }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) throw new NotFoundException('User not found');

            // 1. Ensure Razorpay Contact Exists
            if (!user.razorpayContactId) {
                // We need a phone number. If missing, we can't create contact.
                // For now, fail if phone number is missing or use dummy if acceptable (not recommended for production).
                // Assuming user has updated profile with phone number.
                if (!user.phoneNumber) {
                    // As a fallback, we could try to use a dummy number if we just want to test,
                    // but for real payout, we need real contact.
                    // Let's assume user.phoneNumber is mandatory for payout.
                    throw new BadRequestException('Phone number is required for withdrawal');
                }

                const contact = await this.razorpayPayoutService.createContact(
                    user.name,
                    user.email,
                    user.phoneNumber,
                    'vendor'
                );
                user.razorpayContactId = contact.id;
                await this.userRepository.save(user);
            }

            // 2. Ensure Razorpay Fund Account Exists
            if (!user.razorpayFundAccountId) {
                if (!user.bankDetails || !user.bankDetails.accountNumber) {
                    throw new BadRequestException('Bank details are required for withdrawal');
                }

                const fundAccount = await this.razorpayPayoutService.createFundAccount(
                    user.razorpayContactId,
                    'bank_account',
                    {
                        name: user.bankDetails.beneficiaryName || user.name,
                        ifsc: user.bankDetails.ifsc,
                        account_number: user.bankDetails.accountNumber,
                    }
                );
                user.razorpayFundAccountId = fundAccount.id;
                await this.userRepository.save(user);
            }

            const wallet = await queryRunner.manager.findOne(Wallet, { where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            if (Number(wallet.balance) < Number(amount)) {
                throw new BadRequestException('Insufficient funds');
            }

            // Move funds to lockedBalance
            wallet.balance = Number(wallet.balance) - Number(amount);
            wallet.lockedBalance = Number(wallet.lockedBalance) + Number(amount);
            await queryRunner.manager.save(wallet);

            // Create Debit Transaction (Pending)
            const transaction = queryRunner.manager.create(WalletTransaction, {
                wallet,
                walletId: wallet.id,
                type: WalletTransactionType.DEBIT,
                subType: WalletTransactionsubType.WITHDRAWAL,
                amount,
                status: WalletTransactionStatus.PENDING,
            });
            const savedTransaction = await queryRunner.manager.save(transaction);

            // Create Payout Record
            const payout = queryRunner.manager.create(Payout, {
                wallet,
                walletId: wallet.id,
                amount,
                status: PayoutStatus.PENDING,
            });
            const savedPayout = await queryRunner.manager.save(payout);

            // Link transaction to payout ID as reference
            savedTransaction.referenceId = savedPayout.id;
            await queryRunner.manager.save(savedTransaction);

            await queryRunner.commitTransaction();

            // Initiate Razorpay Payout (Outside DB transaction to avoid locking DB on API call)
            // If it fails, we should technically revert the transaction or mark payout as failed.
            // But we already committed. So we should handle failure here by creating a compensation transaction or updating status.

            try {
                const razorpayPayout = await this.razorpayPayoutService.createPayout(
                    user.bankDetails.accountNumber,
                    user.razorpayFundAccountId,
                    amount,
                    'INR',
                    'IMPS',
                    'payout',
                    true,
                    savedPayout.id // referenceId
                );

                // Update Payout with Razorpay ID
                savedPayout.razorpayPayoutId = razorpayPayout.id;
                await this.payoutRepository.save(savedPayout);

            } catch (error) {
                console.error("Razorpay API failed", error);
                // Mark as failed and refund logic is handled by webhook usually?
                // Or immediate failure?
                // If API call fails (e.g. network), we should probably revert.
                // Let's implement immediate revert for synchronous failure.

                savedPayout.status = PayoutStatus.FAILED;
                savedPayout.failureReason = error.message;
                await this.payoutRepository.save(savedPayout);

                savedTransaction.status = WalletTransactionStatus.FAILED;
                await this.transactionRepository.save(savedTransaction);

                // Revert Wallet Balance
                await this.walletRepository.manager.transaction(async transactionalEntityManager => {
                    const w = await transactionalEntityManager.findOne(Wallet, { where: { id: wallet.id } });
                    w.lockedBalance = Number(w.lockedBalance) - Number(amount);
                    w.balance = Number(w.balance) + Number(amount);
                    await transactionalEntityManager.save(w);
                });

                throw new InternalServerErrorException('Payout initiation failed');
            }

            return { payout: savedPayout, transaction: savedTransaction };

        } catch (err) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async handlePayoutWebhook(payload: any) {
        const { event, payload: { payout: { entity } } } = payload;
        const payoutId = entity.reference_id; // We sent this as reference_id

        if (!payoutId) return; // Should not happen if initiated by us

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const payout = await queryRunner.manager.findOne(Payout, { where: { id: payoutId }, relations: ['wallet'] });
            if (!payout) {
                // Could be a payout not initiated by this system?
                return;
            }

            // Avoid double processing
            if (payout.status !== PayoutStatus.PENDING) return;

            const transaction = await queryRunner.manager.findOne(WalletTransaction, { where: { referenceId: payoutId, type: WalletTransactionType.DEBIT } });
            const wallet = payout.wallet;

            if (event === 'payout.processed') {
                payout.status = PayoutStatus.PROCESSED;
                payout.razorpayPayoutId = entity.id;

                if (transaction) {
                    transaction.status = WalletTransactionStatus.SUCCESS;
                    transaction.metadata = { ...transaction.metadata, razorpayPayoutId: entity.id };
                    await queryRunner.manager.save(transaction);
                }

                // Deduct from lockedBalance (Funds effectively completely gone now)
                wallet.lockedBalance = Number(wallet.lockedBalance) - Number(payout.amount);
                await queryRunner.manager.save(wallet);

                await queryRunner.manager.save(payout);

            } else if (event === 'payout.failed') {
                payout.status = PayoutStatus.FAILED;
                payout.failureReason = entity.failure_reason;
                payout.razorpayPayoutId = entity.id;

                if (transaction) {
                    transaction.status = WalletTransactionStatus.FAILED;
                    transaction.metadata = { ...transaction.metadata, razorpayPayoutId: entity.id };
                    await queryRunner.manager.save(transaction);
                }

                // Refund to Balance
                wallet.lockedBalance = Number(wallet.lockedBalance) - Number(payout.amount);
                wallet.balance = Number(wallet.balance) + Number(payout.amount);
                await queryRunner.manager.save(wallet);

                await queryRunner.manager.save(payout);
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            console.error('Webhook processing failed', err);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
