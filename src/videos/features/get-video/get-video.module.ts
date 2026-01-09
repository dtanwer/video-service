import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../../entity/video.entity';
import { GetVideoController } from './get-video.controller';
import { GetVideoHandler } from './get-video.handler';

import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Transaction } from '../../../payments/entities/transaction.entity';
import { User } from '../../../users/user.entity';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Video, Transaction, User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [GetVideoController],
    providers: [GetVideoHandler],
})
export class GetVideoModule { }
