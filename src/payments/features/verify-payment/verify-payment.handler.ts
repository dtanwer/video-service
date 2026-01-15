import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { VerifyPaymentCommand } from './verify-payment.command';
import { Transaction, TransactionStatus, TransactionType } from '../../entities/transaction.entity';
import { User } from '../../../users/user.entity';
import { PaymentSuccessEvent } from '../../events/payment-success.event';

@CommandHandler(VerifyPaymentCommand)
export class VerifyPaymentHandler implements ICommandHandler<VerifyPaymentCommand> {
    constructor(
        private configService: ConfigService,
        private eventBus: EventBus,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async execute(command: VerifyPaymentCommand): Promise<{ success: boolean }> {
        const { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = command;

        const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(razorpayOrderId + '|' + razorpayPaymentId)
            .digest('hex');

        if (generatedSignature === razorpaySignature) {
            const transaction = await this.transactionRepository.findOne({
                where: { paymentGatewayId: razorpayOrderId },
            });

            if (!transaction) throw new BadRequestException('Transaction not found');

            transaction.status = TransactionStatus.SUCCESS;
            transaction.paymentId = razorpayPaymentId;
            await this.transactionRepository.save(transaction);

            // Grant access (Subscription logic)
            if (transaction.type === TransactionType.SUBSCRIPTION) {
                const user = await this.userRepository.findOne({ where: { id: userId } });
                user.subscriptionPlan = transaction.referenceId;

                const now = new Date();
                now.setDate(now.getDate() + 30);
                user.subscriptionExpiry = now;

                await this.userRepository.save(user);
            }

            // Emit Event
            this.eventBus.publish(new PaymentSuccessEvent(transaction, userId));

            return { success: true };
        } else {
            throw new BadRequestException('Invalid signature');
        }
    }
}
