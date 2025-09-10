import { Module } from '@nestjs/common';
import { EncodeVideoModule } from './features/encode-video/encode-video.module';
@Module({
  imports: [
    EncodeVideoModule,
  ],
  providers: [],
})
export class VideoEncoderModule {}
