import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListVideoQuery } from './list-video.query';


@Controller('video')
export class ListVideoController {
  constructor(private readonly queryBus: QueryBus) {}


  @Get()
  async list() {
    const query = new ListVideoQuery();
    return this.queryBus.execute(query);
  }
} 