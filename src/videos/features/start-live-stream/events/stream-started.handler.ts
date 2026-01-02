import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../../entity/video.entity';
import { StreamStartedEvent } from '../../../../rtmp-server/events/stream-started.event';

@Injectable()
export class StreamStartedHandler {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    @OnEvent(StreamStartedEvent.name)
    async handle(event: StreamStartedEvent) {
        console.log(`Handling StreamStartedEvent for streamKey=${event.streamKey}`);
        // Assuming streamKey is the videoId or we can find video by streamKey
        // If streamKey is videoId:
        await this.videoRepository.update({ id: event.streamKey }, { isLive: true });

        // If streamKey is separate column:
        // await this.videoRepository.update({ streamKey: event.streamKey }, { isLive: true });
    }
}
