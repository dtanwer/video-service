import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListVideoQuery } from './list-video.query';
import { ListVideoDto } from './list-video.dto';

@Controller('video')
export class ListVideoController {
  constructor(private readonly queryBus: QueryBus) { }

  @Get()
  async list(@Query() queryDto: ListVideoDto) {
    const { page, limit } = queryDto;
    const query = new ListVideoQuery(page, limit);
    return this.queryBus.execute(query);
  }
} 