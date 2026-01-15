import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UpdatePlaylistCommand } from './update-playlist.command';
import { Playlist } from '../../entity/playlist.entity';
import { Video } from '../../entity/video.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(UpdatePlaylistCommand)
export class UpdatePlaylistHandler implements ICommandHandler<UpdatePlaylistCommand> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: UpdatePlaylistCommand): Promise<Playlist> {
        const { id, updatePlaylistDto, userId } = command;

        const playlist = await this.playlistRepository.findOne({
            where: { id },
            relations: ['owner'],
        });

        if (!playlist) {
            throw new NotFoundException(`Playlist with ID ${id} not found`);
        }

        if (playlist.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own playlists');
        }

        const { videoIds, ...updateData } = updatePlaylistDto;

        Object.assign(playlist, updateData);

        if (videoIds) {
            const videos = await this.videoRepository.findBy({ id: In(videoIds) });
            playlist.videos = videos;
        }

        return this.playlistRepository.save(playlist);
    }
}
