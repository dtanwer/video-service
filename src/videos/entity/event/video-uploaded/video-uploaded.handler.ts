import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VideoUploadedEvent } from './video-uploaded';
import { CommandBus } from '@nestjs/cqrs';
import { EncodeVideoCommand } from '../../../../video-encoder/features/encode-video/encode-video.command';

@Injectable()
export class VideoUploadedHandler {
  constructor(private readonly commandBus: CommandBus) { }

  @OnEvent(VideoUploadedEvent.name)
  async handle(event: VideoUploadedEvent) {
    console.log("Handling video Uploaded Event .....");
    const video = event.video;
    await this.commandBus.execute(
      new EncodeVideoCommand({
        videoId: video.id,
        fileUrl: `uploads/videos/${video.filename}`,
      }),
    );
  }
}
