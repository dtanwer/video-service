import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEncoder } from '../../entities/video-encoder.entity';
import { EncodeVideoHandler } from './encode-video.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEncoder]),
  ],
  providers: [EncodeVideoHandler],
})
export class  EncodeVideoModule {}
