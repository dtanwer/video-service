import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { UploadVideoCommand } from './upload-video.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { VideoUploadedEvent } from '../../entity/event/video-uploaded/video-uploaded';

@CommandHandler(UploadVideoCommand)
export class UploadVideoHandler implements ICommandHandler<UploadVideoCommand> {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadVideoCommand): Promise<Video> {
    const entity = this.videoRepository.create(command.payload);
    const saved = await this.videoRepository.save(entity);
    await this.eventBus.publish(new VideoUploadedEvent(saved));
    return saved;
  }
} 