import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModule as TypeOrmConfigModule } from "src/type-orm";
import { VideoEncoder } from "src/video-encoder/entities/video-encoder.entity";
import { Video } from "src/videos/entity/video.entity";
import { ProcessVideo } from "../../cli-commands/process-video-command";
import { HLSVideoConverter } from "../../hls-video-converter/hls-video-converter";
import { ProcessVideoHandler } from "./process-videos";

@Module({
    imports: [
        TypeOrmConfigModule,
        TypeOrmModule.forFeature([VideoEncoder, Video])
    ],
    providers: [
        ProcessVideo,
        ProcessVideoHandler,
        HLSVideoConverter
    ]
})

export class ProcessVideoModule { }