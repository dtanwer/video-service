import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListTagsQuery } from './list-tags.query';
import { ListTagsDto } from './list-tags.dto';

@Controller('tags')
export class ListTagsController {
    constructor(private readonly queryBus: QueryBus) { }

    @Get()
    async list(@Query() queryDto: ListTagsDto) {
        const { page, limit, search } = queryDto;
        const query = new ListTagsQuery(page, limit, search);
        return this.queryBus.execute(query);
    }
}
