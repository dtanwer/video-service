import { Module } from '@nestjs/common';
import { UploadVideoModule } from './upload-video/upload-video.module';
import { ListVideoModule } from './list-video/list-video.module';
import { GetVideoModule } from './get-video/get-video.module';
import { ListTagsModule } from './list-tags/list-tags.module';
import { StartLiveStreamModule } from './start-live-stream/start-live-stream.module';
import { CqrsModule } from '@nestjs/cqrs';
import { VideoEncodingStartedHandler } from '../entity/event/video-encoding-started/video-encoding-started.handler';
import { VideoEncodingCompletedHandler } from '../entity/event/video-encoding-completed/video-encoding-completed.handler';
import { VideoEncodingFailedHandler } from '../entity/event/video-encoding-failed/video-encoding-failed.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../entity/video.entity';

@Module({
  imports: [
    UploadVideoModule,
    ListVideoModule,
    GetVideoModule,
    ListTagsModule,
    StartLiveStreamModule,
    CqrsModule,
    TypeOrmModule.forFeature([Video]),
  ],
    providers: [
      VideoEncodingStartedHandler,
      VideoEncodingCompletedHandler,
      VideoEncodingFailedHandler,
    ],
})
export class VideosModule { } 