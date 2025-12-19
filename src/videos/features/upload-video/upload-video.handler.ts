import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { Tag } from '../../entity/tag.entity';
import { UploadVideoCommand } from './upload-video.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { VideoUploadedEvent } from '../../entity/event/video-uploaded/video-uploaded';

@CommandHandler(UploadVideoCommand)
export class UploadVideoHandler implements ICommandHandler<UploadVideoCommand> {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: UploadVideoCommand): Promise<Video> {
    const { tags, ...videoData } = command.payload;
    const entity = this.videoRepository.create(videoData);

    if (tags && tags.length > 0) {
      const tagEntities: Tag[] = [];
      for (const tagName of tags) {
        let tag = await this.tagRepository.findOne({ where: { name: tagName } });
        if (!tag) {
          tag = this.tagRepository.create({ name: tagName });
          await this.tagRepository.save(tag);
        }
        tagEntities.push(tag);
      }
      entity.tags = tagEntities;
    }

    const saved = await this.videoRepository.save(entity);
    await this.eventBus.publish(new VideoUploadedEvent(saved));
    return saved;
  }
} 