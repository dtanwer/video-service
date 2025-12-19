import { Module } from '@nestjs/common';
import { UploadVideoModule } from './upload-video/upload-video.module';
import { ListVideoModule } from './list-video/list-video.module';
import { GetVideoModule } from './get-video/get-video.module';
import { ListTagsModule } from './list-tags/list-tags.module';
import { StartLiveStreamModule } from './start-live-stream/start-live-stream.module';
import { CqrsModule } from '@nestjs/cqrs';
import { VideoUploadedHandler } from '../entity/event/video-uploaded/video-uploaded.handler';

@Module({
  imports: [
    UploadVideoModule,
    ListVideoModule,
    GetVideoModule,
    ListTagsModule,
    StartLiveStreamModule,
    CqrsModule,
  ],
  providers: [
    VideoUploadedHandler
  ],
})
export class VideosModule { } 