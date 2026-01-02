import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventService {
    constructor(private eventEmitter: EventEmitter2) { }

    publish(event: any) {
        // Use the class name as the event name
        const eventName = event.constructor.name;
        this.eventEmitter.emit(eventName, event);
    }
}
