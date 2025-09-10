import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { ListVideoQuery } from './list-video.query';

@QueryHandler(ListVideoQuery)
export class ListVideoHandler implements IQueryHandler<ListVideoQuery> {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async execute(query: ListVideoQuery): Promise<Video[]> {
    return this.videoRepository.find({ order: { createdAt: 'DESC' } });
  }
} 