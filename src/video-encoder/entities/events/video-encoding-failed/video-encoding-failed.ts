import { IEvent } from '@nestjs/cqrs';

export class VideoEncodingFailedEvent implements IEvent {
    constructor(public readonly video: {videoId: string, }, public readonly error: string) { }
}
