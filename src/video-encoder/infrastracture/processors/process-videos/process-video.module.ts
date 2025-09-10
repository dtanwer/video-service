import { Module } from "@nestjs/common";
import { ProcessVideo } from "../../cli-commands/process-video";
import { ProcessVideoHandler } from "./process-videos";

@Module({
    imports:[],
    providers:[ProcessVideo,ProcessVideoHandler]
})

export class ProcessVideoModule {}