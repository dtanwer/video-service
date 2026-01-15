import { IQuery } from '@nestjs/cqrs';

export class GetPlaylistQuery implements IQuery {
    constructor(public readonly id: string) { }
}
