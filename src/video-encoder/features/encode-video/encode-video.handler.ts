import { CommandHandler } from "@nestjs/cqrs";
import { VideoEncoder } from "../../entities/video-encoder.entity";
import { EncodeVideoCommand } from "./encode-video.command";
import { Repository } from "typeorm";

@CommandHandler(EncodeVideoCommand)
export class EncodeVideoHandler {
  constructor(private readonly videoEncoderRepository: Repository<VideoEncoder>) {}

  async execute(command: EncodeVideoCommand) {
      const { videoId, fileUrl } = command.payload;
      const videoEncoder = await this.videoEncoderRepository.create({ videoId, fileUrl });
      return videoEncoder;
  }
}
