import { Controller, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RemoveVideoFromPlaylistCommand } from './remove-video-from-playlist.command';

@Controller('playlists')
export class RemoveVideoFromPlaylistController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/videos/:videoId')
    removeVideo(@Request() req, @Param('id') id: string, @Param('videoId') videoId: string) {
        return this.commandBus.execute(new RemoveVideoFromPlaylistCommand(id, videoId, req.user.id));
    }
}
