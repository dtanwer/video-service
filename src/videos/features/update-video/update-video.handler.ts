import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateVideoCommand } from './update-video.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(UpdateVideoCommand)
export class UpdateVideoHandler implements ICommandHandler<UpdateVideoCommand> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: UpdateVideoCommand): Promise<Video> {
        const { videoId, userId, updateData } = command;

        const video = await this.videoRepository.findOne({ where: { id: videoId } });
        if (!video) throw new NotFoundException('Video not found');

        if (video.userId !== userId) {
            throw new ForbiddenException('You can only update your own videos');
        }

        Object.assign(video, updateData);
        return this.videoRepository.save(video);
    }
}
