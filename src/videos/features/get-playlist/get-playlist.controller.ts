import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetPlaylistQuery } from './get-playlist.query';
import { GetPlaylistsQuery } from './get-playlists.query';

@Controller('playlists')
export class GetPlaylistController {
    constructor(private readonly queryBus: QueryBus) { }

    @Get()
    findAll() {
        return this.queryBus.execute(new GetPlaylistsQuery());
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.queryBus.execute(new GetPlaylistQuery(id));
    }
}
