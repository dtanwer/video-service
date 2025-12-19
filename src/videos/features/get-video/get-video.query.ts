import { IQuery } from '@nestjs/cqrs';

export class GetVideoQuery implements IQuery {
    constructor(public readonly videoId: string) { }
}
