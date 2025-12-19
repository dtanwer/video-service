import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../../entity/tag.entity';
import { ListTagsController } from './list-tags.controller';
import { ListTagsHandler } from './list-tags.handler';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Tag])],
    controllers: [ListTagsController],
    providers: [ListTagsHandler],
})
export class ListTagsModule { }
