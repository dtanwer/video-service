import { Module } from "@nestjs/common";
import { ProcessVideo } from "../../cli-commands/process-video";
import { ProcessVideoHandler } from "./process-videos";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModule as TypeOrmConfigModule } from "src/type-orm";
import { VideoEncoder } from "src/video-encoder/entities/video-encoder.entity";

@Module({
    imports: [
        TypeOrmConfigModule,
        TypeOrmModule.forFeature([VideoEncoder])
    ],
    providers: [
        ProcessVideo,
         ProcessVideoHandler
        ]
})

export class ProcessVideoModule { }