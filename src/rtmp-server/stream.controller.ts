import { Controller, Get, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { RtmpServerService } from './rtmp-server.service';
import { LiveHLSConverter } from './live-hls-conveter';

@Controller('streams')
export class StreamController {
  constructor(
    private readonly rtmpService: RtmpServerService,
    private readonly liveConverter: LiveHLSConverter,
  ) {}

  /**
   * Get all active streams
   */
  @Get()
  getActiveStreams() {
    const streams = this.rtmpService.getActiveStreams();
    
    return {
      success: true,
      count: streams.length,
      streams: streams.map(stream => ({
        streamKey: stream.streamKey,
        startTime: stream.startTime,
        duration: Math.floor((Date.now() - stream.startTime.getTime()) / 1000),
        hlsUrl: `http://localhost:8000/live/${stream.streamKey}/master.m3u8`,
        isActive: true,
      })),
    };
  }

  /**
   * Get specific stream info
   */
  @Get(':streamKey')
  getStream(@Param('streamKey') streamKey: string) {
    const isActive = this.rtmpService.isStreamActive(streamKey);
    
    if (!isActive) {
      throw new HttpException(
        `Stream '${streamKey}' not found or inactive`,
        HttpStatus.NOT_FOUND,
      );
    }

    const streamInfo = this.liveConverter.getStreamInfo(streamKey);
    
    return {
      success: true,
      stream: {
        streamKey: streamInfo.streamKey,
        startTime: streamInfo.startTime,
        duration: Math.floor((Date.now() - streamInfo.startTime.getTime()) / 1000),
        hlsUrl: `http://localhost:8000/live/${streamKey}/master.m3u8`,
        qualities: [
          { resolution: '1080p', url: `http://localhost:8000/live/${streamKey}/1080p/stream.m3u8` },
          { resolution: '720p', url: `http://localhost:8000/live/${streamKey}/720p/stream.m3u8` },
          { resolution: '480p', url: `http://localhost:8000/live/${streamKey}/480p/stream.m3u8` },
          { resolution: '360p', url: `http://localhost:8000/live/${streamKey}/360p/stream.m3u8` },
        ],
        isActive: true,
      },
    };
  }

  /**
   * Stop a specific stream (admin endpoint)
   */
  @Delete(':streamKey')
  async stopStream(@Param('streamKey') streamKey: string) {
    const isActive = this.rtmpService.isStreamActive(streamKey);
    
    if (!isActive) {
      throw new HttpException(
        `Stream '${streamKey}' not found or inactive`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.liveConverter.stopStream(streamKey);
    
    return {
      success: true,
      message: `Stream '${streamKey}' stopped successfully`,
    };
  }

  /**
   * Health check endpoint
   */
  @Get('health/check')
  healthCheck() {
    const activeStreams = this.rtmpService.getActiveStreams();
    
    return {
      success: true,
      status: 'healthy',
      rtmpServer: {
        running: true,
        port: 1935,
      },
      httpServer: {
        running: true,
        port: 8000,
      },
      activeStreams: activeStreams.length,
      uptime: process.uptime(),
    };
  }
}