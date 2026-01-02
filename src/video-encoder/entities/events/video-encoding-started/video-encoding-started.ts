import { IEvent } from '@nestjs/cqrs';

export class VideoEncodingStartedEvent implements IEvent {
    constructor(public readonly video: {videoId: string, }) { }
}
