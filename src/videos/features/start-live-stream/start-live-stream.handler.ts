import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { StartLiveStreamCommand } from './start-live-stream.command';

@CommandHandler(StartLiveStreamCommand)
export class StartLiveStreamHandler implements ICommandHandler<StartLiveStreamCommand> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async execute(command: StartLiveStreamCommand): Promise<any> {
        const { userId, title, description } = command;

        
        const video = this.videoRepository.create({
            userId,
            title,
            description,
            isLive: true,
            isPublished: true, // Assuming live streams are published immediately
            originalName: `live-${Date.now()}`,
            filename: `live-${Date.now()}`,
            mimetype: 'video/mp4', // Placeholder
            sizeBytes: 0,
        });
        
        await this.videoRepository.save(video);
        
        const rtmpUrl = `rtmp://localhost:1935/live`;
        const playbackUrl = `http://localhost:8000/live/${video.id}/index.m3u8`;
        
        return {
            videoId: video.id,
            streamKey:video.id,
            rtmpUrl,
            playbackUrl,
        };
    }
}
