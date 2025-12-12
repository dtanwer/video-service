import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { ListVideoQuery } from './list-video.query';
import { ConfigService } from '@nestjs/config';

@QueryHandler(ListVideoQuery)
export class ListVideoHandler implements IQueryHandler<ListVideoQuery> {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly configService: ConfigService,
  ) { }

  get baseUrl() {
    return this.configService.get<string>('BASE_URL');
  }

  async execute(query: ListVideoQuery) {
    const { page, limit } = query;
    const [videos, total] = await this.videoRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: videos.map((video: Video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        url: `${this.baseUrl}/uploads/videos/hls/${video.id}/master.m3u8`,
        thumbnail: `${this.baseUrl}/uploads/videos/hls/${video.id}/thumbnail.jpg`,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 