import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadVideoController } from './upload-video.controller';
import { UploadVideoHandler } from './upload-video.handler';
import { Video } from '../../entity/video.entity';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CqrsModule],
  controllers: [UploadVideoController],
  providers: [UploadVideoHandler],
})
export class UploadVideoModule {} 