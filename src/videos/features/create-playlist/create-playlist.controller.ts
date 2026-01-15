import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePlaylistDto } from './create-playlist.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CreatePlaylistCommand } from './create-playlist.command';

@Controller('playlists')
export class CreatePlaylistController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() createPlaylistDto: CreatePlaylistDto) {
        return this.commandBus.execute(new CreatePlaylistCommand(createPlaylistDto, req.user));
    }
}
