import { IQuery } from '@nestjs/cqrs';

export class ListTagsQuery implements IQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly search?: string,
    ) { }
}
