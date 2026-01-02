import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../video.entity';
import { VideoEncoderStatus } from '../../enums/video-encoder-status';
import { VideoEncodingFailedEvent } from '../../../../video-encoder/entities/events/video-encoding-failed/video-encoding-failed';

@Injectable()
export class VideoEncodingFailedHandler {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    @OnEvent(VideoEncodingFailedEvent.name)
    async handle(event: VideoEncodingFailedEvent) {
        console.log(`Handling VideoEncodingFailedEvent for videoId=${event.video.videoId}`);
        await this.videoRepository.update(event.video.videoId, {
            status: VideoEncoderStatus.FAILED,
        });
    }
}
