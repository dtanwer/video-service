import { Controller, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { DeletePlaylistCommand } from './delete-playlist.command';

@Controller('playlists')
export class DeletePlaylistController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.commandBus.execute(new DeletePlaylistCommand(id, req.user.id));
    }
}
