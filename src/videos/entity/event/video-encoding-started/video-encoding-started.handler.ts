import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../video.entity';
import { VideoEncoderStatus } from '../../enums/video-encoder-status';
import { VideoEncodingStartedEvent } from '../../../../video-encoder/entities/events/video-encoding-started/video-encoding-started';

@Injectable()
export class VideoEncodingStartedHandler {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    @OnEvent(VideoEncodingStartedEvent.name)
    async handle(event: VideoEncodingStartedEvent) {
        console.log(`Handling VideoEncodingStartedEvent for videoId=${event.video.videoId}`);
        await this.videoRepository.update(event.video.videoId, {
            status: VideoEncoderStatus.PROCESSING,
        });
    }
}
