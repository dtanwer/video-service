import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
import { Video } from '../videos/entity/video.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PlaylistsService {
    constructor(
        @InjectRepository(Playlist)
        private playlistRepository: Repository<Playlist>,
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
    ) { }

    async create(createPlaylistDto: CreatePlaylistDto, user: User) {
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

    findAll() {
        return this.playlistRepository.find({
            relations: ['owner', 'videos'],
        });
    }

    async findOne(id: string) {
        const playlist = await this.playlistRepository.findOne({
            where: { id },
            relations: ['owner', 'videos'],
        });

        if (!playlist) {
            throw new NotFoundException(`Playlist with ID ${id} not found`);
        }

        return playlist;
    }

    async update(id: string, updatePlaylistDto: UpdatePlaylistDto, userId: string) {
        const playlist = await this.findOne(id);

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

    async remove(id: string, userId: string) {
        const playlist = await this.findOne(id);

        if (playlist.ownerId !== userId) {
            throw new ForbiddenException('You can only delete your own playlists');
        }

        return this.playlistRepository.remove(playlist);
    }

    async addVideo(playlistId: string, videoId: string, userId: string) {
        const playlist = await this.findOne(playlistId);

        if (playlist.ownerId !== userId) {
            throw new ForbiddenException('You can only modify your own playlists');
        }

        const video = await this.videoRepository.findOneBy({ id: videoId });
        if (!video) throw new NotFoundException('Video not found');

        // Check if video already exists in playlist to avoid duplicates if necessary, 
        // but TypeORM handles ManyToMany efficiently usually. 
        // However, loading all videos just to check might be expensive for large playlists.
        // For now, let's assume simple append.

        // We need to load videos if not loaded, but findOne loads them.
        playlist.videos.push(video);

        return this.playlistRepository.save(playlist);
    }

    async removeVideo(playlistId: string, videoId: string, userId: string) {
        const playlist = await this.findOne(playlistId);

        if (playlist.ownerId !== userId) {
            throw new ForbiddenException('You can only modify your own playlists');
        }

        playlist.videos = playlist.videos.filter(v => v.id !== videoId);

        return this.playlistRepository.save(playlist);
    }
}
