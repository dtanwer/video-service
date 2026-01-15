import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/entity/video.entity';
import { Playlist } from '../videos/entity/playlist.entity';
import { CreateOrderController } from './features/create-order/create-order.controller';
import { VerifyPaymentController } from './features/verify-payment/verify-payment.controller';
import { CreateOrderHandler } from './features/create-order/create-order.handler';
import { VerifyPaymentHandler } from './features/verify-payment/verify-payment.handler';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Transaction, User, Video, Playlist]),
    ],
    controllers: [CreateOrderController, VerifyPaymentController],
    providers: [CreateOrderHandler, VerifyPaymentHandler],
})
export class PaymentsModule { }
