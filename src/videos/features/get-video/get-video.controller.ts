import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetVideoQuery } from './get-video.query';
import { GetVideoDto } from './get-video.dto';

@Controller('videos')
export class GetVideoController {
    constructor(private readonly queryBus: QueryBus) { }

    @Get(':videoId')
    async getVideo(@Param() params: GetVideoDto) {
        const query = new GetVideoQuery(params.videoId);
        return this.queryBus.execute(query);
    }
}
