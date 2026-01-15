import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import { CreateOrderCommand } from './create-order.command';
import { Transaction, TransactionStatus, TransactionType } from '../../entities/transaction.entity';
import { Video } from '../../../videos/entity/video.entity';
import { Playlist } from '../../../videos/entity/playlist.entity';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    private razorpay: any;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
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

    async execute(command: CreateOrderCommand): Promise<any> {
        const { userId, type, referenceId } = command;
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
            if (referenceId === 'BASIC') amount = 499;
            else if (referenceId === 'PREMIUM') amount = 999;
            else throw new BadRequestException('Invalid subscription plan');
        }

        const options = {
            amount: amount * 100,
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
}
