import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListVideoController } from './list-video.controller';
import { ListVideoHandler } from './list-video.handler';
import { Video } from '../../entity/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  controllers: [ListVideoController],
  providers: [ListVideoHandler],
})
export class ListVideoModule {} 