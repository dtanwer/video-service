import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreatePlaylistCommand } from './create-playlist.command';
import { Playlist } from '../../entity/playlist.entity';
import { Video } from '../../entity/video.entity';

@CommandHandler(CreatePlaylistCommand)
export class CreatePlaylistHandler implements ICommandHandler<CreatePlaylistCommand> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: CreatePlaylistCommand): Promise<Playlist> {
        const { createPlaylistDto, user } = command;
        const { videoIds, ...playlistData } = createPlaylistDto;

        const playlist = this.playlistRepository.create({
            ...playlistData,
            owner: user,
            ownerId: user.id,
        });

        if (videoIds && videoIds.length > 0) {
            const videos = await this.videoRepository.findBy({ id: In(videoIds) });
            playlist.videos = videos;
        }

        return this.playlistRepository.save(playlist);
    }
}
