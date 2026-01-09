import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/entity/video.entity';
import { Playlist } from '../playlists/entities/playlist.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, User, Video, Playlist]),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
