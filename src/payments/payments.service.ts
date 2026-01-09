import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/entity/video.entity';
import { Playlist } from '../playlists/entities/playlist.entity';

@Injectable()
export class PaymentsService {
    private razorpay: any;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        @InjectRepository(Playlist)
        private playlistRepository: Repository<Playlist>,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    async createOrder(userId: string, type: TransactionType, referenceId?: string) {
        let amount = 0;
        let currency = 'INR';

        if (type === TransactionType.VIDEO_PURCHASE) {
            const video = await this.videoRepository.findOne({ where: { id: referenceId } });
            if (!video) throw new BadRequestException('Video not found');
            if (!video.isPaid) throw new BadRequestException('Video is free');
            amount = video.price;
        } else if (type === TransactionType.PLAYLIST_PURCHASE) {
            const playlist = await this.playlistRepository.findOne({ where: { id: referenceId } });
            if (!playlist) throw new BadRequestException('Playlist not found');
            if (!playlist.isPaid) throw new BadRequestException('Playlist is free');
            amount = playlist.price;
        } else if (type === TransactionType.SUBSCRIPTION) {
            // Hardcoded subscription prices for now, can be moved to DB or Config
            if (referenceId === 'BASIC') amount = 499;
            else if (referenceId === 'PREMIUM') amount = 999;
            else throw new BadRequestException('Invalid subscription plan');
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        };

        try {
            const order = await this.razorpay.orders.create(options);

            const transaction = this.transactionRepository.create({
                userId,
                amount,
                currency,
                type,
                status: TransactionStatus.PENDING,
                referenceId,
                paymentGatewayId: order.id,
                metadata: order,
            });

            await this.transactionRepository.save(transaction);

            return order;
        } catch (error) {
            throw new BadRequestException('Error creating Razorpay order');
        }
    }

    async verifyPayment(
        userId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ) {
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

            // Grant access
            await this.grantAccess(userId, transaction);

            return { success: true };
        } else {
            throw new BadRequestException('Invalid signature');
        }
    }

    private async grantAccess(userId: string, transaction: Transaction) {
        if (transaction.type === TransactionType.SUBSCRIPTION) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            user.subscriptionPlan = transaction.referenceId; // BASIC or PREMIUM

            const now = new Date();
            // Add 30 days for simplicity
            now.setDate(now.getDate() + 30);
            user.subscriptionExpiry = now;

            await this.userRepository.save(user);
        }
        // For Video/Playlist, the transaction record itself is proof of purchase
    }
}
