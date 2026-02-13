import { Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Video } from './videos/entity/video.entity';
import { VideoEncoder } from './video-encoder/entities/video-encoder.entity';
import { Tag } from './videos/entity/tag.entity';
import { Playlist } from './videos/entity/playlist.entity';
import { Transaction } from './payments/entities/transaction.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { WalletTransaction } from './wallet/entities/wallet-transaction.entity';
import { Payout } from './wallet/entities/payout.entity';

@Module({
  imports: [
    NestTypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'youtube',
      entities: [User, Video, VideoEncoder, Tag, Playlist, Transaction, Wallet, WalletTransaction, Payout],
      synchronize: true, // Set to false in production
      // logging: true,
    }),
  ],
})
export class TypeOrmModule { }
