import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyVideosQuery } from './get-my-videos.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Video } from '../../entity/video.entity';

@QueryHandler(GetMyVideosQuery)
export class GetMyVideosHandler implements IQueryHandler<GetMyVideosQuery> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(query: GetMyVideosQuery): Promise<any> {
        const { userId, page = 1, limit = 10, search, status, visibility } = query;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<Video> = {
            userId,
        };

        if (search) {
            where.title = Like(`%${search}%`);
        }

        if (status) {
            where.status = status;
        }

        if (visibility) {
            where.isPublished = visibility === 'public';
        }

        const [videos, total] = await this.videoRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        const data = videos.map((video) => ({
            id: video.id,
            title: video.title || 'Untitled',
            description: video.description || '',
            thumbnail: '', // Placeholder
            url: video.playbackUrl || video.rtmpUrl || '',
            visibility: video.isPublished ? 'public' : 'private',
            encodingStatus: video.status,
            sizeBytes: Number(video.sizeBytes) || 0,
            durationSeconds: video.durationSeconds || 0,
            createdAt: video.createdAt.toISOString(),
            updatedAt: video.updatedAt.toISOString(),
            views: 0,
            isPaid: video.isPaid,
            price: Number(video.price) || 0,
            isPublished: video.isPublished,
        }));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
