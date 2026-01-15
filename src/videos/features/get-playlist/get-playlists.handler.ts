import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPlaylistsQuery } from './get-playlists.query';
import { Playlist } from '../../entity/playlist.entity';

@QueryHandler(GetPlaylistsQuery)
export class GetPlaylistsHandler implements IQueryHandler<GetPlaylistsQuery> {
    constructor(
        @InjectRepository(Playlist)
        private readonly playlistRepository: Repository<Playlist>,
    ) { }

    async execute(query: GetPlaylistsQuery): Promise<Playlist[]> {
        return this.playlistRepository.find({
            relations: ['owner', 'videos'],
        });
    }
}
