import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPlaylistQuery } from './get-playlist.query';
import { Playlist } from '../../entity/playlist.entity';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetPlaylistQuery)
export class GetPlaylistHandler implements IQueryHandler<GetPlaylistQuery> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
    ) { }

    async execute(query: GetPlaylistQuery): Promise<Playlist> {
        const { id } = query;
        const playlist = await this.playlistRepository.findOne({
            where: { id },
            relations: ['owner', 'videos'],
        });

        if (!playlist) {
            throw new NotFoundException(`Playlist with ID ${id} not found`);
        }

        return playlist;
    }
}
