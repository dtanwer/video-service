import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';

interface LiveStreamConfig {
  streamKey: string;
  inputUrl: string;
  outputDir: string;
}

interface ActiveStream {
  streamKey: string;
  process: ChildProcess;
  startTime: Date;
  outputDir: string;
}

interface QualityVariant {
  name: string;
  height: number;
  width: number;
  videoBitrate: string;
  audioBitrate: string;
  bandwidth: number;
  fps: number;
}

@Injectable()
export class LiveHLSConverter {
  private readonly logger = new Logger(LiveHLSConverter.name);
  private activeStreams: Map<string, ActiveStream> = new Map();
  
  private readonly baseDir = path.join(process.cwd(), 'uploads', 'live');
  
  private readonly qualities: QualityVariant[] = [
    { name: '1080p', height: 1080, width: 1920, videoBitrate: '5000k', audioBitrate: '192k', bandwidth: 5500000, fps: 30 },
    { name: '720p', height: 720, width: 1280, videoBitrate: '2800k', audioBitrate: '128k', bandwidth: 3000000, fps: 30 },
    { name: '480p', height: 480, width: 854, videoBitrate: '1400k', audioBitrate: '128k', bandwidth: 1500000, fps: 30 },
    { name: '360p', height: 360, width: 640, videoBitrate: '800k', audioBitrate: '96k', bandwidth: 900000, fps: 30 },
  ];

  /**
   * Start live HLS conversion from RTMP stream
   */
  async startStream(streamKey: string, rtmpUrl: string): Promise<void> {
    if (this.activeStreams.has(streamKey)) {
      this.logger.warn(`Stream ${streamKey} is already active`);
      return;
    }

    this.logger.log(`Starting HLS conversion for stream: ${streamKey}`);

    try {
      // Create output directory
      const outputDir = await this.createStreamDirectory(streamKey);

      await this.extractSingleThumbnail(rtmpUrl, path.join(outputDir, 'thumbnail.jpg'));

      // Start FFmpeg process for multi-quality streaming
      const ffmpegProcess = await this.startFFmpegProcess({
        streamKey,
        inputUrl: rtmpUrl,
        outputDir,
      });

      // Store active stream info
      this.activeStreams.set(streamKey, {
        streamKey,
        process: ffmpegProcess,
        startTime: new Date(),
        outputDir,
      });

      this.logger.log(`✓ Stream ${streamKey} started successfully`);
      this.logger.log(`  HLS Output: ${outputDir}/master.m3u8`);
    } catch (error) {
      this.logger.error(`Failed to start stream ${streamKey}:`, error);
      throw error;
    }
  }



  /**
   * Extract a single thumbnail at specific timestamp
   */
  private async extractSingleThumbnail(
  inputStreamUrl: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-rtmp_live', 'live',
      '-fflags', 'nobuffer',
      '-flags', 'low_delay',
      '-i', inputStreamUrl,
      '-frames:v', '1',
      '-q:v', '2',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args);
    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
    });

    ffmpeg.on('error', (error) => {
      reject(new Error(`Failed to spawn FFmpeg: ${error.message}`));
    });
  });
}



  /**
   * Stop live stream conversion
   */
  async stopStream(streamKey: string): Promise<void> {
    const stream = this.activeStreams.get(streamKey);
    
    if (!stream) {
      this.logger.warn(`Stream ${streamKey} is not active`);
      return;
    }

    this.logger.log(`Stopping stream: ${streamKey}`);

    try {
      // Kill FFmpeg process gracefully
      stream.process.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force kill if still running
      if (!stream.process.killed) {
        stream.process.kill('SIGKILL');
      }

      // Clean up directory (optional - you might want to keep recordings)
      // await this.cleanupStreamDirectory(stream.outputDir);

      this.activeStreams.delete(streamKey);
      this.logger.log(`✓ Stream ${streamKey} stopped`);
    } catch (error) {
      this.logger.error(`Error stopping stream ${streamKey}:`, error);
      throw error;
    }
  }

  /**
   * Create directory structure for live stream
   */
  private async createStreamDirectory(streamKey: string): Promise<string> {
    const outputDir = path.join(this.baseDir, streamKey);
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      
      // // Create directories for each quality
      // for (const quality of this.qualities) {
      //   await fs.mkdir(path.join(outputDir, quality.name), { recursive: true });
      // }
      
      return outputDir;
    } catch (error) {
      throw new Error(`Failed to create stream directory: ${error.message}`);
    }
  }

  /**
   * Start FFmpeg process for live streaming with adaptive bitrate
   */
  private async startFFmpegProcess(config: LiveStreamConfig): Promise<ChildProcess> {
    return new Promise((resolve, reject) => {
      // Build the complex filter for scaling and splitting
      const filterComplex = this.buildFilterComplex();
      
      const args = [
        '-i', config.inputUrl,
        '-filter_complex', filterComplex,
        
        // Map video and audio streams for each quality
        ...this.buildStreamMappings(),
        
        // Encoding settings for each quality
        ...this.buildEncodingSettings(),
        
        // HLS settings
        '-f', 'hls',
        '-hls_time', '4',
        '-hls_list_size', '10',
        '-hls_flags', 'append_list',
        '-hls_segment_type', 'mpegts',
        '-master_pl_name', 'master.m3u8',
        '-var_stream_map', this.buildStreamMap(),
        
        // Output pattern
        path.join(config.outputDir, '%v/stream.m3u8')
      ];

      this.logger.debug(`FFmpeg command: ffmpeg ${args.join(' ')}`);

      const ffmpeg = spawn('ffmpeg', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let isResolved = false;
      let startupTimeout: NodeJS.Timeout;

      // Handle stdout
      ffmpeg.stdout.on('data', (data) => {
        this.logger.debug(`FFmpeg stdout: ${data}`);
      });

      // Handle stderr (FFmpeg outputs progress here)
      ffmpeg.stderr.on('data', (data) => {
        const message = data.toString();
        
        // Resolve promise once stream starts successfully
        if (!isResolved && (message.includes('Opening') || message.includes('muxer') || message.includes('hls'))) {
          isResolved = true;
          clearTimeout(startupTimeout);
          resolve(ffmpeg);
        }

        // Log progress periodically
        if (message.includes('frame=') || message.includes('time=')) {
          this.logger.debug(message.trim());
        }

        // Log errors
        if (message.toLowerCase().includes('error') && !message.includes('Error while decoding stream')) {
          this.logger.error(`FFmpeg error: ${message.trim()}`);
        }
      });

      // Handle process errors
      ffmpeg.on('error', (error) => {
        this.logger.error(`FFmpeg process error: ${error.message}`);
        if (!isResolved) {
          clearTimeout(startupTimeout);
          reject(error);
        }
      });

      // Handle process exit
      ffmpeg.on('close', (code, signal) => {
        this.logger.log(`FFmpeg process closed: code=${code}, signal=${signal}`);
        this.activeStreams.delete(config.streamKey);
      });

      // Resolve after timeout if process seems to be running
      startupTimeout = setTimeout(() => {
        if (!isResolved && !ffmpeg.killed) {
          isResolved = true;
          this.logger.log('FFmpeg process started (timeout resolution)');
          resolve(ffmpeg);
        }
      }, 5000);
    });
  }

  /**
   * Build complex filter for scaling to multiple resolutions
   */
  private buildFilterComplex(): string {
    const filters: string[] = [];

    this.qualities.forEach((quality, index) => {
      // Scale to exact dimensions (both divisible by 2)
      filters.push(`[0:v]scale=${quality.width}:${quality.height}:force_original_aspect_ratio=decrease,pad=${quality.width}:${quality.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${index}]`);
    });

    return filters.join(';');
  }

  /**
   * Build stream mappings
   */
  private buildStreamMappings(): string[] {
    const mappings: string[] = [];

    this.qualities.forEach((quality, index) => {
      mappings.push('-map', `[v${index}]`);
      mappings.push('-map', '0:a:0');
    });

    return mappings;
  }

  /**
   * Build encoding settings for all qualities
   */
  private buildEncodingSettings(): string[] {
    const settings: string[] = [];

    this.qualities.forEach((quality, index) => {
      const videoBitrateNum = parseInt(quality.videoBitrate);
      const maxrate = Math.floor(videoBitrateNum * 1.5);
      const bufsize = videoBitrateNum * 2;

      settings.push(
        // Video encoding
        `-c:v:${index}`, 'libx264',
        `-b:v:${index}`, quality.videoBitrate,
        `-maxrate:v:${index}`, `${maxrate}k`,
        `-bufsize:v:${index}`, `${bufsize}k`,
        `-preset`, 'veryfast',
        `-tune`, 'zerolatency',
        `-profile:v:${index}`, 'main',
        `-level:v:${index}`, '4.0',
        `-g:v:${index}`, (quality.fps * 2).toString(),
        `-keyint_min:v:${index}`, quality.fps.toString(),
        `-sc_threshold:v:${index}`, '0',
        `-r:v:${index}`, quality.fps.toString(),
        
        // Audio encoding
        `-c:a:${index}`, 'aac',
        `-b:a:${index}`, quality.audioBitrate,
        `-ac:a:${index}`, '2',
        `-ar:a:${index}`, '48000'
      );
    });

    return settings;
  }

  /**
   * Build stream mapping string for HLS variants
   */
  private buildStreamMap(): string {
    return this.qualities
      .map((_, index) => `v:${index},a:${index}`)
      .join(' ');
  }

  /**
   * Get active stream info
   */
  getStreamInfo(streamKey: string): ActiveStream | undefined {
    return this.activeStreams.get(streamKey);
  }

  /**
   * Get all active streams
   */
  getAllActiveStreams(): ActiveStream[] {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Check if stream is active
   */
  isStreamActive(streamKey: string): boolean {
    return this.activeStreams.has(streamKey);
  }

  /**
   * Clean up stream directory
   */
  private async cleanupStreamDirectory(dir: string): Promise<void> {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      this.logger.log(`Cleaned up directory: ${dir}`);
    } catch (error) {
      this.logger.error(`Failed to cleanup directory ${dir}:`, error);
    }
  }

  /**
   * Stop all active streams (for graceful shutdown)
   */
  async stopAllStreams(): Promise<void> {
    const streamKeys = Array.from(this.activeStreams.keys());
    
    this.logger.log(`Stopping ${streamKeys.length} active streams...`);
    
    await Promise.all(
      streamKeys.map(key => this.stopStream(key))
    );
  }
}