import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoEncoder, VideoEncoderStatus } from "src/video-encoder/entities/video-encoder.entity";
import { Repository } from "typeorm";
import * as path from 'path';
import { HLSVideoConverter } from "../../hls-video-converter/hls-video-converter";
import { EventService } from "src/shared/event/event.service";
import { VideoEncodingStartedEvent } from "src/video-encoder/entities/events/video-encoding-started/video-encoding-started";
import { VideoEncodingCompletedEvent } from "src/video-encoder/entities/events/video-encoding-completed/video-encoding-completed";
import { VideoEncodingFailedEvent } from "src/video-encoder/entities/events/video-encoding-failed/video-encoding-failed";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ProcessVideoHandler {

  constructor(
    @InjectRepository(VideoEncoder)
    private readonly videoEncoderRepository: Repository<VideoEncoder>,
    private readonly converter: HLSVideoConverter,
    private readonly eventService: EventService,
    private readonly configService: ConfigService
  ) { }

  async start(limit: number = 1): Promise<void> {
    console.log("Video Processing Start ......");

    const pendingItems = await this.videoEncoderRepository.find({
      where: { status: VideoEncoderStatus.PENDING, isCompleted: false },
      take: limit
    });

    if (pendingItems.length === 0) {
      console.log("No pending videos to process.");
      return;
    }

    for (const item of pendingItems) {
      await this.processVideo(item.videoId);
    }
  }

  async processVideo(videoId: string): Promise<void> {
    const item = await this.videoEncoderRepository.findOne({ where: { videoId } });
    if (!item) {
      console.error(`VideoEncoder entry not found for videoId=${videoId}`);
      return;
    }

    try {
      await this.updateStatus(item, VideoEncoderStatus.PROCESSING);
      await this.eventService.publish(new VideoEncodingStartedEvent({ videoId: item.videoId }));

      const sourcePath = item.fileUrl; // absolute or project-relative path stored in DB
      const outputPath = path.join(
        path.dirname(sourcePath),
        "hls",
        item.videoId
      );

      await this.converter.convert(sourcePath, item.videoId);

      item.isCompleted = true;
      item.error = null;
      await this.updateStatus(item, VideoEncoderStatus.COMPLETED);

      const playbackUrl = `${this.configService.get<string>('BASE_URL')}/uploads/videos/hls/${item.videoId}/master.m3u8`;
      await this.eventService.publish(new VideoEncodingCompletedEvent({ videoId: item.videoId, playbackUrl }));

      console.log(`Processed videoId=${item.videoId} → ${outputPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      item.error = message?.slice(0, 1000);
      item.isCompleted = false;
      await this.updateStatus(item, VideoEncoderStatus.FAILED);
      await this.eventService.publish(new VideoEncodingFailedEvent({ videoId: item.videoId }, message));
      console.error(`Failed processing videoId=${item.videoId}:`, message);
    }
  }

  private async updateStatus(entity: VideoEncoder, status: VideoEncoderStatus): Promise<void> {
    entity.status = status;
    entity.updatedAt = new Date();
    await this.videoEncoderRepository.save(entity);
  }

}
