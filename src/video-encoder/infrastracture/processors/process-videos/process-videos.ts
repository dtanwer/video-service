import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoEncoder, VideoEncoderStatus } from "src/video-encoder/entities/video-encoder.entity";
import { Repository } from "typeorm";


import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

@Injectable()

export class ProcessVideoHandler {

    constructor(
        @InjectRepository(VideoEncoder)
        private readonly videoEncoderRepository: Repository<VideoEncoder>
    ) { }

    async start(limit: number = 1): Promise<void> {
        console.log("Video Processing Start ......");
        const converter = new HLSVideoConverter();

        const pendingItems = await this.videoEncoderRepository.find({
            where: { status: VideoEncoderStatus.PENDING, isCompleted: false },
            take: limit
        });

        if (pendingItems.length === 0) {
            console.log("No pending videos to process.");
            return;
        }

        for (const item of pendingItems) {
            try {
                await this.updateStatus(item, VideoEncoderStatus.PROCESSING);

                const sourcePath = item.fileUrl; // absolute or project-relative path stored in DB
                const outputPath = path.join(
                    path.dirname(sourcePath),
                    "hls",
                    item.videoId
                );

                await converter.convert(sourcePath, item.videoId);

                item.isCompleted = true;
                item.error = null;
                await this.updateStatus(item, VideoEncoderStatus.COMPLETED);

                console.log(`Processed videoId=${item.videoId} → ${outputPath}`);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                item.error = message?.slice(0, 1000);
                item.isCompleted = false;
                await this.updateStatus(item, VideoEncoderStatus.FAILED);
                console.error(`Failed processing videoId=${item.videoId}:`, message);
            }
        }
    }

    private async updateStatus(entity: VideoEncoder, status: VideoEncoderStatus): Promise<void> {
        entity.status = status;
        entity.updatedAt = new Date();
        await this.videoEncoderRepository.save(entity);
    }

    // private async videoHasAudio(videoPath: string): Promise<boolean> {
    //     try {
    //         const { stdout } = await exec(`ffprobe -i "${videoPath}" -show_streams -select_streams a -loglevel error`);
    //         return stdout.includes("codec_type=audio");
    //     } catch (err) {
    //         console.error("ffprobe error:", err);
    //         return false;
    //     }
    // }

    // private async processVideo(videoPath: string, outputPath: string): Promise<void> {
    //     try {
    //         const { stdout } = await exec(
    //             `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`
    //         );
    //         console.log(`Original video dimensions: ${stdout.trim()}`);
    //     } catch (err) {
    //         console.error("Error getting video dimensions:", err);
    //     }

    //     return await new Promise<void>(async (resolve, reject) => {
    //         if (!fs.existsSync(outputPath)) {
    //             fs.mkdirSync(outputPath, { recursive: true });
    //         }

    //         const hasAudio = await this.videoHasAudio(videoPath);
    //         console.log("✌️hasAudio --->", hasAudio);



    //         let args: string[] = [
    //             "-i", videoPath,
    //             "-preset", "medium",
    //             "-crf", "23",
    //             "-threads", "2",
    //         ];

    //         args = args.concat([
    //             // 1080p - High quality, closer to original
    //             "-map", "0:v:0", "-c:v:0", "libx264", "-b:v:0", "6000k", "-maxrate:v:0", "6400k",
    //             "-bufsize:v:0", "12000k", "-vf:v:0", "scale=-2:1080", "-s:v:0", "1920x1080",

    //             // 720p - Good quality
    //             "-map", "0:v:0", "-c:v:1", "libx264", "-b:v:1", "3000k", "-maxrate:v:1", "3200k",
    //             "-bufsize:v:1", "6000k", "-vf:v:1", "scale=-2:720", "-s:v:1", "1280x720",

    //             // 480p - Medium quality
    //             "-map", "0:v:0", "-c:v:2", "libx264", "-b:v:2", "1500k", "-maxrate:v:2", "1600k",
    //             "-bufsize:v:2", "3000k", "-vf:v:2", "scale=-2:480", "-s:v:2", "854x480", // Standard 16:9 480p

    //             // 360p - Lower quality
    //             "-map", "0:v:0", "-c:v:3", "libx264", "-b:v:3", "800k", "-maxrate:v:3", "850k",
    //             "-bufsize:v:3", "1600k", "-vf:v:3", "scale=-2:360", "-s:v:3", "640x360",

    //             // 144p - Very low quality
    //             "-map", "0:v:0", "-c:v:4", "libx264", "-b:v:4", "350k", "-maxrate:v:4", "400k",
    //             "-bufsize:v:4", "700k", "-vf:v:4", "scale=-2:144", "-s:v:4", "256x144",
    //         ]);

    //         if (hasAudio) {
    //             args = args.concat([
    //                 "-map", "0:a:0?", "-c:a:0", "aac", "-b:a:0", "128k",
    //                 "-map", "0:a:0?", "-c:a:1", "aac", "-b:a:1", "96k",
    //                 "-map", "0:a:0?", "-c:a:2", "aac", "-b:a:2", "64k",
    //                 "-map", "0:a:0?", "-c:a:3", "aac", "-b:a:3", "48k",
    //                 "-map", "0:a:0?", "-c:a:4", "aac", "-b:a:4", "32k",
    //             ]);

    //             args.push(
    //                 "-var_stream_map", "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p v:3,a:3,name:360p v:4,a:4,name:144p"
    //             );
    //         } else {
    //             args.push(
    //                 "-var_stream_map", "v:0,name:1080p v:1,name:720p v:2,name:480p v:3,name:360p v:4,name:144p"
    //             );
    //         }

    //         args = args.concat([
    //             "-master_pl_name", "master.m3u8",
    //             "-f", "hls",
    //             "-hls_time", "6",
    //             "-hls_list_size", "0",
    //             "-hls_segment_type", "mpegts",
    //             "-hls_playlist_type", "vod",
    //             "-hls_flags", "independent_segments",
    //             "-hls_segment_filename", `${outputPath}/quality_%v/segment%03d.ts`,
    //         ]);

    //         // Removed unsupported options like '-streaminfo' and '-hls_master_name'.

    //         args.push(`${outputPath}/quality_%v/playlist.m3u8`);

    //         console.log("Starting FFmpeg with arguments:", args.join(" "));

    //         const ffmpeg = spawn("ffmpeg", args, {
    //             stdio: ["ignore", "pipe", "pipe"],
    //         });

    //         let stdoutData = "";
    //         let stderrData = "";

    //         ffmpeg.stdout.on("data", (data: Buffer) => {
    //             const dataStr = data.toString();
    //             stdoutData += dataStr;
    //             console.log(`FFmpeg stdout: ${dataStr}`);
    //         });

    //         ffmpeg.stderr.on("data", (data: Buffer) => {
    //             const dataStr = data.toString();
    //             stderrData += dataStr;
    //             console.error(`FFmpeg stderr: ${dataStr}`);
    //         });

    //         ffmpeg.on("close", (code: number) => {
    //             if (code === 0) {
    //                 resolve();
    //             } else {
    //                 console.error(`FFmpeg process exited with code ${code}`);
    //                 console.error("FFmpeg stderr output:", stderrData);
    //                 reject(new Error(`FFmpeg process exited with code ${code}`));
    //             }
    //         });

    //         const timeout = setTimeout(() => {
    //             ffmpeg.kill("SIGKILL");
    //             reject(new Error("FFmpeg process timed out after 4 hours"));
    //         }, 4 * 60 * 60 * 1000);

    //         ffmpeg.on("exit", () => clearTimeout(timeout));
    //     });
    // }
}




interface QualityConfig {
  resolution: string;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  bandwidth: number;
}

interface VideoInfo {
  hasAudio: boolean;
  hasVideo: boolean;
  duration: number;
  width: number;
  height: number;
}

class HLSVideoConverter {
  private readonly qualities: QualityConfig[] = [
    { resolution: '1080p', height: 1080, videoBitrate: '5000k', audioBitrate: '192k', bandwidth: 5500000 },
    { resolution: '720p', height: 720, videoBitrate: '2800k', audioBitrate: '128k', bandwidth: 3000000 },
    { resolution: '480p', height: 480, videoBitrate: '1400k', audioBitrate: '128k', bandwidth: 1500000 },
    { resolution: '360p', height: 360, videoBitrate: '800k', audioBitrate: '96k', bandwidth: 900000 },
    { resolution: '144p', height: 144, videoBitrate: '300k', audioBitrate: '64k', bandwidth: 400000 },
  ];

 private readonly baseDir = path.join(process.cwd(), 'uploads', 'videos', 'hls');

  /**
   * Check if FFmpeg is installed
   */
  private async checkFFmpeg(): Promise<void> {
    try {
      await execAsync('ffmpeg -version');
    } catch (error) {
      throw new Error('FFmpeg is not installed or not in PATH');
    }
  }

  /**
   * Check if FFprobe is installed
   */
  private async checkFFprobe(): Promise<void> {
    try {
      await execAsync('ffprobe -version');
    } catch (error) {
      throw new Error('FFprobe is not installed or not in PATH');
    }
  }

  /**
   * Get video information using ffprobe
   */
  private async getVideoInfo(videoPath: string): Promise<VideoInfo> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_streams -show_format "${videoPath}"`
      );

      const info = JSON.parse(stdout);
      
      const videoStream = info.streams.find((s: any) => s.codec_type === 'video');
      const audioStream = info.streams.find((s: any) => s.codec_type === 'audio');

      if (!videoStream) {
        throw new Error('No video stream found in the input file');
      }

      return {
        hasAudio: !!audioStream,
        hasVideo: !!videoStream,
        duration: parseFloat(info.format.duration || 0),
        width: videoStream.width || 0,
        height: videoStream.height || 0,
      };
    } catch (error) {
      throw new Error(`Failed to probe video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create directory structure
   */
  private async createDirectories(videoId: string): Promise<string> {
    const outputDir = path.join(this.baseDir, videoId);
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      
      for (const quality of this.qualities) {
        await fs.mkdir(path.join(outputDir, quality.resolution), { recursive: true });
      }
      
      return outputDir;
    } catch (error) {
      throw new Error(`Failed to create directories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert video to specific quality
   */
  private async convertQuality(
    inputVideo: string,
    quality: QualityConfig,
    outputDir: string,
    hasAudio: boolean,
    originalHeight: number
  ): Promise<void> {
    // Skip if requested quality is higher than source
    if (quality.height > originalHeight) {
      console.log(`⚠ Skipping ${quality.resolution} (higher than source resolution)`);
      return;
    }

    const qualityDir = path.join(outputDir, quality.resolution);
    const playlistPath = path.join(qualityDir, 'playlist.m3u8');
    const segmentPath = path.join(qualityDir, 'segment_%03d.ts');

    return new Promise((resolve, reject) => {
      const videoBitrateNum = parseInt(quality.videoBitrate);
      const maxrate = Math.floor(videoBitrateNum * 1.5);
      const bufsize = videoBitrateNum * 2;

      const args = [
        '-i', inputVideo,
        '-vf', `scale=-2:${quality.height}`,
        '-c:v', 'libx264',
        '-b:v', quality.videoBitrate,
        '-maxrate', `${maxrate}k`,
        '-bufsize', `${bufsize}k`,
        '-preset', 'medium',
        '-profile:v', 'main',
        '-level', '4.0',
        '-hls_time', '6',
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', segmentPath,
        '-hls_flags', 'independent_segments',
      ];

      // Add audio encoding if audio stream exists
      if (hasAudio) {
        args.push(
          '-c:a', 'aac',
          '-b:a', quality.audioBitrate,
          '-ac', '2',
          '-ar', '48000'
        );
      } else {
        args.push('-an'); // No audio
      }

      args.push(playlistPath, '-y');

      console.log(`Converting to ${quality.resolution}...`);

      const ffmpeg = spawn('ffmpeg', args);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`✓ ${quality.resolution} conversion complete`);
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`Failed to spawn FFmpeg: ${error.message}`));
      });
    });
  }

  /**
   * Create master playlist
   */
  private async createMasterPlaylist(
    outputDir: string,
    hasAudio: boolean,
    originalHeight: number
  ): Promise<void> {
    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
    
    let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    const audioCodec = hasAudio ? ',mp4a.40.2' : '';

    for (const quality of this.qualities) {
      // Skip qualities higher than source
      if (quality.height > originalHeight) {
        continue;
      }

      const width = Math.floor(quality.height * (16 / 9)); // Assuming 16:9 aspect ratio
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},RESOLUTION=${width}x${quality.height},CODECS="avc1.640028${audioCodec}"\n`;
      content += `${quality.resolution}/playlist.m3u8\n\n`;
    }

    try {
      await fs.writeFile(masterPlaylistPath, content);
      console.log('✓ Master playlist created');
    } catch (error) {
      throw new Error(`Failed to create master playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Extract thumbnails from video
   */
  private async extractThumbnails(
    inputVideo: string,
    outputDir: string,
    videoId: string,
    duration: number
  ): Promise<string[]> {
    const thumbnailDir = path.join(outputDir, 'thumbnails');
    
    try {
      await fs.mkdir(thumbnailDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create thumbnail directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const thumbnails: string[] = [];
    const timestamps = this.calculateThumbnailTimestamps(duration);

    console.log(`Extracting ${timestamps.length} thumbnails...`);

    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const thumbnailName = `thumbnail_${i + 1}.jpg`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailName);

      try {
        await this.extractSingleThumbnail(inputVideo, thumbnailPath, timestamp);
        thumbnails.push(thumbnailPath);
        console.log(`  ✓ Thumbnail ${i + 1}/${timestamps.length} extracted (${timestamp}s)`);
      } catch (error) {
        console.error(`  ✗ Failed to extract thumbnail at ${timestamp}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Create main thumbnail (first one)
    if (thumbnails.length > 0) {
      const mainThumbnailPath = path.join(outputDir, 'thumbnail.jpg');
      await fs.copyFile(thumbnails[0], mainThumbnailPath);
      console.log(`✓ Main thumbnail saved: ${mainThumbnailPath}`);
    }

    return thumbnails;
  }

  /**
   * Calculate timestamps for thumbnail extraction
   */
  private calculateThumbnailTimestamps(duration: number): number[] {
    const timestamps: number[] = [];
    
    if (duration <= 30) {
      // For short videos, extract 3 thumbnails
      timestamps.push(
        Math.floor(duration * 0.1),
        Math.floor(duration * 0.5),
        Math.floor(duration * 0.9)
      );
    } else if (duration <= 120) {
      // For medium videos, extract 5 thumbnails
      for (let i = 1; i <= 5; i++) {
        timestamps.push(Math.floor(duration * (i / 6)));
      }
    } else {
      // For long videos, extract 10 thumbnails
      for (let i = 1; i <= 10; i++) {
        timestamps.push(Math.floor(duration * (i / 11)));
      }
    }

    return timestamps.filter(t => t > 0 && t < duration);
  }

  /**
   * Extract a single thumbnail at specific timestamp
   */
  private async extractSingleThumbnail(
    inputVideo: string,
    outputPath: string,
    timestamp: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-ss', timestamp.toString(),
        '-i', inputVideo,
        '-vframes', '1',
        '-q:v', '2',
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
        outputPath,
        '-y'
      ];

      const ffmpeg = spawn('ffmpeg', args);
      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`Failed to spawn FFmpeg: ${error.message}`));
      });
    });
  }


  /**
   * Main conversion method
   */
  async convert(videoPath: string, videoId: string): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HLS Multi-Quality Video Converter');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Check if input file exists
      await fs.access(videoPath);
    } catch {
      throw new Error(`Input video file not found: ${videoPath}`);
    }

    // Check dependencies
    console.log('Checking dependencies...');
    await this.checkFFmpeg();
    await this.checkFFprobe();
    console.log('✓ FFmpeg and FFprobe found\n');

    // Get video information
    console.log('Analyzing video...');
    const videoInfo = await this.getVideoInfo(videoPath);
    
    console.log(`✓ Video analyzed:`);
    console.log(`  - Resolution: ${videoInfo.width}x${videoInfo.height}`);
    console.log(`  - Duration: ${videoInfo.duration.toFixed(2)}s`);
    console.log(`  - Has audio: ${videoInfo.hasAudio ? 'Yes' : 'No'}`);
    
    if (!videoInfo.hasAudio) {
      console.log('  ⚠ Warning: Video has no audio track\n');
    } else {
      console.log('');
    }

    // Create directories
    console.log('Creating directory structure...');
    const outputDir = await this.createDirectories(videoId);
    console.log(`✓ Directories created at: ${outputDir}\n`);

    // Convert to different qualities
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Starting conversions...\n');

    for (const quality of this.qualities) {
      try {
        await this.convertQuality(
          videoPath,
          quality,
          outputDir,
          videoInfo.hasAudio,
          videoInfo.height
        );
      } catch (error) {
        console.error(`✗ Failed to convert ${quality.resolution}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create master playlist
    console.log('Creating master playlist...');
    await this.createMasterPlaylist(outputDir, videoInfo.hasAudio, videoInfo.height);

     console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // Extract thumbnails
    console.log('Extracting thumbnails...\n');
    const thumbnails = await this.extractThumbnails(
      videoPath,
      outputDir,
      videoId,
      videoInfo.duration
    );

    // Display summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Conversion Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Master playlist: ${path.join(outputDir, 'master.m3u8')}\n`);
    console.log('Quality variants created:');
    
    for (const quality of this.qualities) {
      if (quality.height <= videoInfo.height) {
        const bitrateDisplay = quality.videoBitrate.replace('k', ' kbps');
        console.log(`  • ${quality.resolution.padEnd(5)} - ${bitrateDisplay}${videoInfo.hasAudio ? ' (with audio)' : ' (video only)'}`);
      }
    }
    console.log('');
  }
}

// Main execution
const main = async () => {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: ts-node convert_video.ts <input_video> <video-id>');
    console.error('Example: ts-node convert_video.ts sample.mp4 abc123');
    process.exit(1);
  }

  const [videoPath, videoId] = args;

  const converter = new HLSVideoConverter();

  try {
    await converter.convert(videoPath, videoId);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}

export default HLSVideoConverter;
