import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListVideoQuery } from './list-video.query';
import { ListVideoDto } from './list-video.dto';

@Controller('videos')
export class ListVideoController {
  constructor(private readonly queryBus: QueryBus) { }

  @Get()
  async list(@Query() queryDto: ListVideoDto) {
    const { page, limit, search, tag } = queryDto;
    const query = new ListVideoQuery(page, limit, search, tag);
    return this.queryBus.execute(query);
  }
} 