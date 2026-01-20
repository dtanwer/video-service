import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetVideoController } from './get-video.controller';
import { GetVideoHandler } from './get-video.handler';
import { VideoAccessModule } from '../../services/video-access.module';

@Module({
    imports: [
        CqrsModule,
        VideoAccessModule,
    ],
    controllers: [GetVideoController],
    providers: [GetVideoHandler],
})
export class GetVideoModule { }
