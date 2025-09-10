import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadVideoController } from './upload-video.controller';
import { UploadVideoHandler } from './upload-video.handler';
import { Video } from '../../entity/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  controllers: [UploadVideoController],
  providers: [UploadVideoHandler],
  exports: [UploadVideoHandler],
})
export class UploadVideoModule {} 