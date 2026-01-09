import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetVideoQuery } from './get-video.query';
import { GetVideoDto } from './get-video.dto';
import { OptionalJwtAuthGuard } from '../../../auth/guards/optional-jwt-auth.guard';

@Controller('videos')
export class GetVideoController {
    constructor(private readonly queryBus: QueryBus) { }

    @Get(':videoId')
    @UseGuards(OptionalJwtAuthGuard)
    async getVideo(@Request() req, @Param() params: GetVideoDto) {
        const query = new GetVideoQuery(params.videoId, req.user?.id);
        return this.queryBus.execute(query);
    }
}
