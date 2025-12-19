import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoEncoder, VideoEncoderStatus } from "src/video-encoder/entities/video-encoder.entity";
import { Repository } from "typeorm";
import * as path from 'path';
import { HLSVideoConverter } from "../../hls-video-converter/hls-video-converter";
import { Video } from "src/videos/entity/video.entity";

@Injectable()
export class ProcessVideoHandler {

  constructor(
    @InjectRepository(VideoEncoder)
    private readonly videoEncoderRepository: Repository<VideoEncoder>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly converter: HLSVideoConverter,
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
      const video = await this.videoRepository.findOne({ where: { id: item.videoId } });
      if (!video) {
        console.error(`Video not found for videoId=${item.videoId}`);
        continue;
      }

      try {
        await this.updateStatus(item, VideoEncoderStatus.PROCESSING);

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

        console.log(`Processed videoId=${item.videoId} → ${outputPath}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        item.error = message?.slice(0, 1000);
        item.isCompleted = false;
        await this.updateStatus(item, VideoEncoderStatus.FAILED);
        console.error(`Failed processing videoId=${item.videoId}:`, message);
      }
    }
  }

  private async updateStatus(entity: VideoEncoder, status: VideoEncoderStatus): Promise<void> {
    entity.status = status;
    entity.updatedAt = new Date();
    await this.videoEncoderRepository.save(entity);
  }

}
