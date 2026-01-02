import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VideoUploadedEvent } from '../../../videos/entity/event/video-uploaded/video-uploaded';
import { ProcessVideoHandler } from '../../infrastracture/processors/process-videos/process-videos';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEncoder } from '../../entities/video-encoder.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideoUploadedHandler {
    constructor(
        private readonly processVideoHandler: ProcessVideoHandler,
        @InjectRepository(VideoEncoder)
        private readonly videoEncoderRepository: Repository<VideoEncoder>,
    ) { }

    @OnEvent(VideoUploadedEvent.name)
    async handle(event: VideoUploadedEvent) {
        console.log("Handling video Uploaded Event in VideoEncoder Module.....");
        const video = event.video;

        // Create VideoEncoder entity
        const videoEncoder = this.videoEncoderRepository.create({
            videoId: video.id,
            fileUrl: `uploads/videos/${video.filename}`,
        });
        await this.videoEncoderRepository.save(videoEncoder);

        // Trigger processing immediately
        await this.processVideoHandler.processVideo(video.id);
    }
}
