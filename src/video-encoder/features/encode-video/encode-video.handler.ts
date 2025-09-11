import { CommandHandler } from "@nestjs/cqrs";
import { VideoEncoder } from "../../entities/video-encoder.entity";
import { EncodeVideoCommand } from "./encode-video.command";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@CommandHandler(EncodeVideoCommand)
export class EncodeVideoHandler {
  constructor(
    @InjectRepository(VideoEncoder)
    private readonly videoEncoderRepository: Repository<VideoEncoder>) {}

  async execute(command: EncodeVideoCommand) {
    console.log("Handling Video encode command.....")
      const { videoId, fileUrl } = command.payload;
      const videoEncoder = this.videoEncoderRepository.create({ videoId, fileUrl });
      await this.videoEncoderRepository.save(videoEncoder);
      
  }
}
