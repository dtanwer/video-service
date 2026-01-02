import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModule as TypeOrmConfigModule } from "src/type-orm";
import { VideoEncoder } from "src/video-encoder/entities/video-encoder.entity";
import { Video } from "src/videos/entity/video.entity";
import { ProcessVideo } from "../../cli-commands/process-video-command";
import { HLSVideoConverter } from "../../hls-video-converter/hls-video-converter";
import { ProcessVideoHandler } from "./process-videos";
import { SharedEventModule } from "src/shared/event/event.module";
import { VideosModule } from "src/videos/features/videos.module";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CqrsModule.forRoot(),
        TypeOrmConfigModule,
        TypeOrmModule.forFeature([VideoEncoder, Video]),
        SharedEventModule,
        VideosModule
    ],
    providers: [
        ProcessVideo,
        ProcessVideoHandler,
        HLSVideoConverter
    ]
})

export class ProcessVideoModule { }