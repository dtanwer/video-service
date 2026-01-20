import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { VideoAccessService } from './video-access.service';
import { Video } from '../entity/video.entity';
import { User } from '../../users/user.entity';
import { Transaction } from '../../payments/entities/transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Video, User, Transaction]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    providers: [VideoAccessService],
    exports: [VideoAccessService],
})
export class VideoAccessModule { }
