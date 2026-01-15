import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoveVideoFromPlaylistCommand } from './remove-video-from-playlist.command';
import { Playlist } from '../../entity/playlist.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(RemoveVideoFromPlaylistCommand)
export class RemoveVideoFromPlaylistHandler implements ICommandHandler<RemoveVideoFromPlaylistCommand> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
    ) { }

    async execute(command: RemoveVideoFromPlaylistCommand): Promise<Playlist> {
        const { playlistId, videoId, userId } = command;

        const playlist = await this.playlistRepository.findOne({
            where: { id: playlistId },
            relations: ['videos'],
        });

        if (!playlist) {
            throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
        }

        if (playlist.ownerId !== userId) {
            throw new ForbiddenException('You can only modify your own playlists');
        }

        playlist.videos = playlist.videos.filter(v => v.id !== videoId);

        return this.playlistRepository.save(playlist);
    }
}
