import { Module } from '@nestjs/common';
import { RtmpServerService } from './rtmp-server.service';
import { StreamController } from './stream.controller';
import { LiveHLSConverter } from './live-hls-conveter';

@Module({
    providers: [RtmpServerService, LiveHLSConverter],
    controllers: [StreamController],
    exports: [RtmpServerService, LiveHLSConverter],
})
export class RtmpServerModule { }
