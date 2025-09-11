import { Module } from '@nestjs/common';
import { UploadVideoModule } from './upload-video/upload-video.module';
import { ListVideoModule } from './list-video/list-video.module';
import { CqrsModule } from '@nestjs/cqrs';
import { VideoUploadedHandler } from '../entity/event/video-uploaded/video-uploaded.handler';

@Module({
  imports: [UploadVideoModule, ListVideoModule, CqrsModule],
  providers: [VideoUploadedHandler],
})
export class VideosModule {} 