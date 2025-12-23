import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { LiveHLSConverter, } from './live-hls-conveter';

const NodeMediaServer = require('node-server-media');

@Injectable()
export class RtmpServerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RtmpServerService.name);
    private nms: any;

    constructor(private readonly liveConverter: LiveHLSConverter) { }

    onModuleInit() {
        const config = {
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            },
            http: {
                port: 8000,
                mediaroot: './media',
                allow_origin: '*'
            },
            logType: 3 // Verbose logging
        };

        this.nms = new NodeMediaServer(config);
        this.setupEventListeners();
        this.nms.run();

        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.log('RTMP Server Started');
        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.logger.log(`RTMP URL: rtmp://localhost:1935/live`);
        this.logger.log(`HTTP Server: http://localhost:8000`);
        this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    private setupEventListeners() {
        // Connection events
        this.nms.on('preConnect', (id: string, args: any) => {
            this.logger.log(`[preConnect] Client connecting - id: ${id}`);
        });

        this.nms.on('postConnect', (id: string, args: any) => {
            this.logger.log(`[postConnect] Client connected - id: ${id}`);
        });

        this.nms.on('doneConnect', (id: string, args: any) => {
            this.logger.log(`[doneConnect] Client disconnected - id: ${id}`);
        });

        // Publish events (when someone starts streaming)
        this.nms.on('prePublish', (id: string, StreamPath: string, args: any) => {
            this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.logger.log('[prePublish] Stream starting...');
            this.logger.log(`  ID: ${id}`);
            this.logger.log(`  Path: ${StreamPath}`);
            this.logger.log(`  Args: ${JSON.stringify(args)}`);

            // Extract stream key from path (e.g., /live/mystream -> mystream)
            const streamKey = this.extractStreamKey(StreamPath);
            this.logger.log(`  Stream Key: ${streamKey}`);

            // Here you can add authentication logic
            // if (!this.isStreamKeyValid(streamKey)) {
            //     this.nms.rejectPublish(id);
            //     return;
            // }
        });

        this.nms.on('postPublish', async (id: string, StreamPath: string, args: any) => {
            try {
                const streamKey = this.extractStreamKey(StreamPath);

                this.logger.log('[postPublish] Stream published successfully!');
                this.logger.log(`  Stream Key: ${streamKey}`);
                this.logger.log(`  Starting HLS conversion...`);

                // Construct RTMP URL for this stream
                const rtmpUrl = `rtmp://127.0.0.1:1935${StreamPath}`;

                // Start HLS conversion
                await this.liveConverter.startStream(streamKey, rtmpUrl);

                this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                this.logger.log('✓ Live stream ready!');
                this.logger.log(`  HLS Playlist: http://localhost:8000/live/${streamKey}/master.m3u8`);
                this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            } catch (error) {
                this.logger.error(`[postPublish] Failed to start HLS conversion:`, error);
            }
        });

        this.nms.on('donePublish', async (id: string, StreamPath: string, args: any) => {
            try {
                const streamKey = this.extractStreamKey(StreamPath);

                this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                this.logger.log('[donePublish] Stream ended');
                this.logger.log(`  Stream Key: ${streamKey}`);
                this.logger.log(`  Stopping HLS conversion...`);

                // Stop HLS conversion
                await this.liveConverter.stopStream(streamKey);

                this.logger.log('✓ Stream stopped and cleaned up');
                this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            } catch (error) {
                this.logger.error(`[donePublish] Error stopping stream:`, error);
            }
        });

        // Play events (when someone watches the stream)
        this.nms.on('prePlay', (id: string, StreamPath: string, args: any) => {
            this.logger.debug(`[prePlay] Viewer connecting - Stream: ${StreamPath}`);
        });

        this.nms.on('postPlay', (id: string, StreamPath: string, args: any) => {
            const streamKey = this.extractStreamKey(StreamPath);
            this.logger.log(`[postPlay] Viewer started watching - Stream: ${streamKey}`);
        });

        this.nms.on('donePlay', (id: string, StreamPath: string, args: any) => {
            const streamKey = this.extractStreamKey(StreamPath);
            this.logger.log(`[donePlay] Viewer stopped watching - Stream: ${streamKey}`);
        });
    }

    /**
     * Extract stream key from RTMP path
     * Example: /live/mystream -> mystream
     */
    private extractStreamKey(streamPath: string): string {
        const parts = streamPath.split('/');
        return parts[parts.length - 1] || 'unknown';
    }

    /**
     * Optional: Validate stream key
     */
    private isStreamKeyValid(streamKey: string): boolean {
        // Add your authentication logic here
        // For example, check against database of valid stream keys
        return true;
    }

    /**
     * Get active streams info
     */
    getActiveStreams():any {
        return this.liveConverter.getAllActiveStreams();
    }

    /**
     * Check if a specific stream is active
     */
    isStreamActive(streamKey: string): boolean {
        return this.liveConverter.isStreamActive(streamKey);
    }

    async onModuleDestroy() {
        this.logger.log('Shutting down RTMP server...');

        // Stop all active streams first
        await this.liveConverter.stopAllStreams();

        // Stop RTMP server
        if (this.nms) {
            this.nms.stop();
            this.logger.log('✓ RTMP server stopped');
        }
    }
}