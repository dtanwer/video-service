import { IQuery } from '@nestjs/cqrs';

export class ListVideoQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
    ) { }
}