import { ICommand } from "@nestjs/cqrs";

export interface EncodeVideoPayload {
    videoId: string;
    fileUrl: string;
}

export class EncodeVideoCommand implements ICommand {
    constructor(public readonly payload: EncodeVideoPayload) {}
}