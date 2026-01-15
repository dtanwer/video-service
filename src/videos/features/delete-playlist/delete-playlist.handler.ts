import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletePlaylistCommand } from './delete-playlist.command';
import { Playlist } from '../../entity/playlist.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(DeletePlaylistCommand)
export class DeletePlaylistHandler implements ICommandHandler<DeletePlaylistCommand> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
    ) { }

    async execute(command: DeletePlaylistCommand): Promise<void> {
        const { id, userId } = command;

        const playlist = await this.playlistRepository.findOne({ where: { id } });

        if (!playlist) {
            throw new NotFoundException(`Playlist with ID ${id} not found`);
        }

        if (playlist.ownerId !== userId) {
            throw new ForbiddenException('You can only delete your own playlists');
        }

        await this.playlistRepository.remove(playlist);
    }
}
