import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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
    const { page, limit, search, tag } = query;
    const where: any = {};

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (tag) {
      where.tags = {
        name: tag,
      };
    }

    const [videos, total] = await this.videoRepository.findAndCount({
      where,
      relations: ['user', 'tags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: videos.map((video: Video) => {
        const thumbnail = `${this.baseUrl}/uploads/videos/hls/${video.id}/thumbnail.jpg`;
        const liveThumbnail = `${this.baseUrl}/uploads/live/${video.id}/thumbnail.jpg`;
        return{
        id: video.id,
        title: video.title,
        isLive: video.isLive,
        durationSeconds: video.durationSeconds,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        thumbnail: video.isLive ? liveThumbnail : thumbnail,
        user: video.user
          ? {
            id: video.user.id,
            name: video.user.name,
            avatar: video.user.avatar,
          }
          : null,
      }
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 