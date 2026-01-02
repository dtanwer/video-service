import { IEvent } from '@nestjs/cqrs';
import { Video } from 'src/videos/entity/video.entity';

export class VideoEncodingCompletedEvent implements IEvent {
    constructor(public readonly video: {videoId: string, }) { }
}
