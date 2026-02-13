import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Payout } from './entities/payout.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Payment } from '../payments/entities/payment.entity';
import { Video } from '../videos/entity/video.entity';
import { Playlist } from '../videos/entity/playlist.entity';
import { PaymentSuccessListener } from './listeners/payment-success.listener';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsModule } from '../payments/payments.module';
import { User } from '../users/user.entity';

import { WalletWebhookController } from './wallet.webhook.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Wallet, WalletTransaction, Payout, Payment, Video, Playlist, User]),
        CqrsModule,
        PaymentsModule,
    ],
    controllers: [WalletController, WalletWebhookController],
    providers: [WalletService, PaymentSuccessListener],
    exports: [WalletService],
})
export class WalletModule { }
