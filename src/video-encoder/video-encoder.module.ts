import { Module } from '@nestjs/common';
import { EncodeVideoModule } from './features/encode-video/encode-video.module';
import { ProcessVideoModule } from './infrastracture/processors/process-videos/process-video.module';
import { VideoUploadedHandler } from './features/video-uploaded/video-uploaded.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEncoder } from './entities/video-encoder.entity';
@Module({
  imports: [
    EncodeVideoModule,
    ProcessVideoModule,
    TypeOrmModule.forFeature([VideoEncoder]),
  ],
  providers: [VideoUploadedHandler],
})
export class VideoEncoderModule { }
