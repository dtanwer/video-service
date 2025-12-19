import { Module } from '@nestjs/common';
import { RtmpServerService } from './rtmp-server.service';

@Module({
    providers: [RtmpServerService],
    exports: [RtmpServerService],
})
export class RtmpServerModule { }
