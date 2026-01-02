import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../video.entity';
import { VideoEncoderStatus } from '../../enums/video-encoder-status';
import { VideoEncodingCompletedEvent } from '../../../../video-encoder/entities/events/video-encoding-completed/video-encoding-completed';

@Injectable()
export class VideoEncodingCompletedHandler {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    @OnEvent(VideoEncodingCompletedEvent.name)
    async handle(event: VideoEncodingCompletedEvent) {
        console.log(`Handling VideoEncodingCompletedEvent for videoId=${event.video.videoId}`);
        await this.videoRepository.update(event.video.videoId, {
            status: VideoEncoderStatus.COMPLETED,
            isPublished: true, // Optionally publish automatically
            playbackUrl: event.video.playbackUrl,
        });
    }
}
