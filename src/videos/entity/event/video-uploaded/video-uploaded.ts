import { IEvent } from "@nestjs/cqrs";
import { Video } from "../../video.entity";

export class VideoUploadedEvent implements IEvent {
  constructor(public readonly video: Video) {}
}