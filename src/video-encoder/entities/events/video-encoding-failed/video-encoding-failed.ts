import { IEvent } from '@nestjs/cqrs';
import { Video } from 'src/videos/entity/video.entity';

export class VideoEncodingFailedEvent implements IEvent {
    constructor(public readonly video: Video, public readonly error: string) { }
}
