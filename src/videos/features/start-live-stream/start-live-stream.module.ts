import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../../entity/video.entity';
import { StartLiveStreamController } from './start-live-stream.controller';
import { StartLiveStreamHandler } from './start-live-stream.handler';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Video]),
    ],
    controllers: [StartLiveStreamController],
    providers: [StartLiveStreamHandler],
})
export class StartLiveStreamModule { }
