import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../../entity/video.entity';
import { GetVideoController } from './get-video.controller';
import { GetVideoHandler } from './get-video.handler';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Video])],
    controllers: [GetVideoController],
    providers: [GetVideoHandler],
})
export class GetVideoModule { }
