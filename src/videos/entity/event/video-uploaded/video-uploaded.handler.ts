import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { VideoUploadedEvent } from './video-uploaded';
import { CommandBus } from '@nestjs/cqrs';
import { EncodeVideoCommand } from '../../../../video-encoder/features/encode-video/encode-video.command';

@EventsHandler(VideoUploadedEvent)
export class VideoUploadedHandler implements IEventHandler<VideoUploadedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

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
