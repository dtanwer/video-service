import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tag } from '../../entity/tag.entity';
import { ListTagsQuery } from './list-tags.query';

@QueryHandler(ListTagsQuery)
export class ListTagsHandler implements IQueryHandler<ListTagsQuery> {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) { }

    async execute(query: ListTagsQuery) {
        const { page, limit, search } = query;
        const where: any = {};

        if (search) {
            where.name = ILike(`%${search}%`);
        }

        const [tags, total] = await this.tagRepository.findAndCount({
            where,
            order: { name: 'ASC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: tags,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
