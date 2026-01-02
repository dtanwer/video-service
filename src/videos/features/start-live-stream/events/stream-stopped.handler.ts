import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../../entity/video.entity';
import { StreamStoppedEvent } from '../../../../rtmp-server/events/stream-stopped.event';

@Injectable()
export class StreamStoppedHandler {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    @OnEvent(StreamStoppedEvent.name)
    async handle(event: StreamStoppedEvent) {
        console.log(`Handling StreamStoppedEvent for streamKey=${event.streamKey}`);
        await this.videoRepository.update({ id: event.streamKey }, { isLive: false });
    }
}
