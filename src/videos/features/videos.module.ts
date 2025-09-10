import { Module } from '@nestjs/common';
import { UploadVideoModule } from './upload-video/upload-video.module';
import { ListVideoModule } from './list-video/list-video.module';

@Module({
  imports: [UploadVideoModule, ListVideoModule],
})
export class VideosModule {} 