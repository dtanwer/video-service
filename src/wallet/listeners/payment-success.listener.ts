import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSuccessEvent } from '../../payments/events/payment-success.event';
import { WalletService } from '../wallet.service';
import { Payment, PaymentStatus } from '../../payments/entities/payment.entity';
import { Video } from '../../videos/entity/video.entity';
import { Playlist } from '../../videos/entity/playlist.entity';
import { TransactionType } from '../../payments/entities/transaction.entity';

@EventsHandler(PaymentSuccessEvent)
export class PaymentSuccessListener implements IEventHandler<PaymentSuccessEvent> {
    constructor(
        private readonly walletService: WalletService,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
    ) { }

    async handle(event: PaymentSuccessEvent) {
        const { transaction } = event;

        // Only process purchases (Video/Playlist)
        if (
            transaction.type !== TransactionType.VIDEO_PURCHASE &&
            transaction.type !== TransactionType.PLAYLIST_PURCHASE
        ) {
            return;
        }

        let creatorId: string | null = null;
        const amount = Number(transaction.amount);

        // Find Creator
        if (transaction.type === TransactionType.VIDEO_PURCHASE) {
            const video = await this.videoRepository.findOne({ where: { id: transaction.referenceId } });
            if (video) creatorId = video.userId;
        } else if (transaction.type === TransactionType.PLAYLIST_PURCHASE) {
            const playlist = await this.playlistRepository.findOne({ where: { id: transaction.referenceId } });
            if (playlist) creatorId = playlist.ownerId;
        }

        if (!creatorId) {
            console.error(`Creator not found for transaction ${transaction.id}`);
            return;
        }

        // Calculate Commission
        const adminCommission = amount * 0.20;
        const creatorAmount = amount * 0.80;

        // Create Payment Record
        const payment = this.paymentRepository.create({
            orderId: transaction.paymentGatewayId || 'UNKNOWN',
            paymentId: transaction.paymentId,
            totalAmount: amount,
            adminCommission,
            creatorAmount,
            creatorId,
            status: PaymentStatus.COMPLETED,
        });
        await this.paymentRepository.save(payment);

        // Credit Wallet
        await this.walletService.creditWallet(
            creatorId,
            creatorAmount,
            payment.id,
            {
                transactionId: transaction.id,
                type: transaction.type,
                referenceId: transaction.referenceId,
            },
        );
    }
}
