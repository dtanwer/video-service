import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeMediaServer = require('node-media-server');

@Injectable()
export class RtmpServerService implements OnModuleInit {
    private readonly logger = new Logger(RtmpServerService.name);
    private nms: any;

    onModuleInit() {
        const config = {
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60,
            },
            http: {
                port: 8000,
                mediaroot: './uploads/media',
                allow_origin: '*',
            },
            trans: {
                ffmpeg: '/usr/bin/ffmpeg',
                tasks: [
                    {
                        app: 'live',
                        hls: true,
                        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                        hlsKeep: true, // to prevent hls file delete after end the stream
                        dash: true,
                        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
                    },
                ],
            },
        };

        this.nms = new NodeMediaServer(config);
        this.nms.run();
        this.logger.log('NodeMediaServer started on rtmp:1935 and http:8000');

        this.nms.on('prePublish', (id, StreamPath, args) => {
            this.logger.log(`[NodeEvent on prePublish] id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
            // Implement stream key validation here if needed
        });
    }
}
