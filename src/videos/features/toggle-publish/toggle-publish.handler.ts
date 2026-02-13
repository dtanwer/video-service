import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TogglePublishCommand } from './toggle-publish.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(TogglePublishCommand)
export class TogglePublishHandler implements ICommandHandler<TogglePublishCommand> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: TogglePublishCommand): Promise<Video> {
        const { videoId, userId, isPublished } = command;

        const video = await this.videoRepository.findOne({ where: { id: videoId } });
        if (!video) throw new NotFoundException('Video not found');

        if (video.userId !== userId) {
            throw new ForbiddenException('You can only update your own videos');
        }

        video.isPublished = isPublished;
        return this.videoRepository.save(video);
    }
}
