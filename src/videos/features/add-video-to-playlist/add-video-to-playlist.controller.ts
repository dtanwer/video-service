import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AddVideoToPlaylistCommand } from './add-video-to-playlist.command';

@Controller('playlists')
export class AddVideoToPlaylistController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Post(':id/videos/:videoId')
    addVideo(@Request() req, @Param('id') id: string, @Param('videoId') videoId: string) {
        return this.commandBus.execute(new AddVideoToPlaylistCommand(id, videoId, req.user.id));
    }
}
