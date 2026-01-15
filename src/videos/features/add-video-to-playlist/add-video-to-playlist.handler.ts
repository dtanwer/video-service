import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddVideoToPlaylistCommand } from './add-video-to-playlist.command';
import { Playlist } from '../../entity/playlist.entity';
import { Video } from '../../entity/video.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(AddVideoToPlaylistCommand)
export class AddVideoToPlaylistHandler implements ICommandHandler<AddVideoToPlaylistCommand> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: AddVideoToPlaylistCommand): Promise<Playlist> {
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

        const video = await this.videoRepository.findOneBy({ id: videoId });
        if (!video) throw new NotFoundException('Video not found');

        // Check if video already exists
        if (!playlist.videos.some(v => v.id === videoId)) {
            playlist.videos.push(video);
            return this.playlistRepository.save(playlist);
        }

        return playlist;
    }
}
