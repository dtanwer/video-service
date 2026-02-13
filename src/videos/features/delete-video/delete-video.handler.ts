import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteVideoCommand } from './delete-video.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(DeleteVideoCommand)
export class DeleteVideoHandler implements ICommandHandler<DeleteVideoCommand> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: DeleteVideoCommand): Promise<void> {
        const { videoId, userId } = command;

        const video = await this.videoRepository.findOne({ where: { id: videoId } });
        if (!video) throw new NotFoundException('Video not found');

        if (video.userId !== userId) {
            throw new ForbiddenException('You can only delete your own videos');
        }

        await this.videoRepository.remove(video);
    }
}
