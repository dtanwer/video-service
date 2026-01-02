import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../../entity/video.entity';
import { StartLiveStreamController } from './start-live-stream.controller';
import { StartLiveStreamHandler } from './start-live-stream.handler';
import { StreamStartedHandler } from './events/stream-started.handler';
import { StreamStoppedHandler } from './events/stream-stopped.handler';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Video]),
    ],
    controllers: [StartLiveStreamController],
    providers: [
        StartLiveStreamHandler,
        StreamStartedHandler,
        StreamStoppedHandler,
    ],
})
export class StartLiveStreamModule { }
