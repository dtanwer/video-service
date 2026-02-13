import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMyVideosQuery } from './get-my-videos.query';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetMyVideosDto } from './get-my-videos.dto';

@Controller('videos')
export class GetMyVideosController {
    constructor(private readonly queryBus: QueryBus) { }

    @Get('my-videos')
    @UseGuards(JwtAuthGuard)
    async getMyVideos(@Request() req, @Query() queryDto: GetMyVideosDto) {
        const { page, limit, search, status, visibility } = queryDto;
        return this.queryBus.execute(
            new GetMyVideosQuery(req.user.id, page, limit, search, status, visibility),
        );
    }
}
