import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('playlists')
export class PlaylistsController {
    constructor(private readonly playlistsService: PlaylistsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() createPlaylistDto: CreatePlaylistDto) {
        return this.playlistsService.create(createPlaylistDto, req.user);
    }

    @Get()
    findAll() {
        return this.playlistsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.playlistsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto) {
        return this.playlistsService.update(id, updatePlaylistDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.playlistsService.remove(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/videos/:videoId')
    addVideo(@Request() req, @Param('id') id: string, @Param('videoId') videoId: string) {
        return this.playlistsService.addVideo(id, videoId, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/videos/:videoId')
    removeVideo(@Request() req, @Param('id') id: string, @Param('videoId') videoId: string) {
        return this.playlistsService.removeVideo(id, videoId, req.user.id);
    }
}
