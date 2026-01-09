import { Module } from '@nestjs/common';
import { RtmpServerService } from './rtmp-server.service';
import { StreamController } from './stream.controller';
import { LiveHLSConverter } from './live-hls-conveter';
import { MediaController } from './media.controller';
import { JwtModule } from '@nestjs/jwt';
import { ContentAccessGuard } from '../auth/guards/content-access.guard';
import { ConfigService } from '@nestjs/config';
import { SharedEventModule } from '../shared/event/event.module';

@Module({
    imports: [
        SharedEventModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [StreamController, MediaController],
    providers: [RtmpServerService, LiveHLSConverter, ContentAccessGuard],
    exports: [RtmpServerService]
})
export class RtmpServerModule { }
