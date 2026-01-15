import { Controller, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePlaylistDto } from './update-playlist.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UpdatePlaylistCommand } from './update-playlist.command';

@Controller('playlists')
export class UpdatePlaylistController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto) {
        return this.commandBus.execute(new UpdatePlaylistCommand(id, updatePlaylistDto, req.user.id));
    }
}
