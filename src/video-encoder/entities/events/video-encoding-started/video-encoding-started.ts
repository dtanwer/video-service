import { IEvent } from '@nestjs/cqrs';
import { Video } from 'src/videos/entity/video.entity';

export class VideoEncodingStartedEvent implements IEvent {
    constructor(public readonly video: Video) { }
}
