import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { GetVideoQuery } from './get-video.query';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetVideoQuery)
export class GetVideoHandler implements IQueryHandler<GetVideoQuery> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        private readonly configService: ConfigService,
    ) { }

    get baseUrl() {
        return this.configService.get<string>('BASE_URL');
    }

    async execute(query: GetVideoQuery) {
        const { videoId } = query;
        const video = await this.videoRepository.findOne({
            where: { id: videoId },
            relations: ['user'],
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        
        return {
            id: video.id,
            title: video.title,
            description: video.description,
            sizeBytes: video.sizeBytes,
            durationSeconds: video.durationSeconds,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt,
            url: video?.playbackUrl,
            status: video.status,
            thumbnail: `${this.baseUrl}/uploads/videos/hls/${video.id}/thumbnail.jpg`,
            user: video.user
                ? {
                    id: video.user.id,
                    name: video.user.name,
                    avatar: video.user.avatar,
                }
                : null,
        };
    }
}
