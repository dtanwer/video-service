import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { UploadVideoCommand } from './upload-video.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UploadVideoCommand)
export class UploadVideoHandler implements ICommandHandler<UploadVideoCommand> {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async execute(command: UploadVideoCommand): Promise<Video> {
    const entity = this.videoRepository.create(command.payload);
    return this.videoRepository.save(entity);
  }
} 