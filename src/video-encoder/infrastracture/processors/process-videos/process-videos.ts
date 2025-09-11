import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoEncoder, VideoEncoderStatus } from "src/video-encoder/entities/video-encoder.entity";
import { Repository } from "typeorm";
import { promisify } from "util";
import { exec as execCallback, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const exec = promisify(execCallback);

@Injectable()

export class ProcessVideoHandler {

    constructor(
        @InjectRepository(VideoEncoder)
        private readonly videoEncoderRepository: Repository<VideoEncoder>
    ) {}

    async start(limit: number = 1): Promise<void> {
        console.log("Video Processing Start ......");

        const pendingItems = await this.videoEncoderRepository.find({
            where: { status: VideoEncoderStatus.PENDING, isCompleted: false },
            take:limit
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

                await this.processVideo(sourcePath, outputPath);

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

    private async videoHasAudio(videoPath: string): Promise<boolean> {
        try {
            const { stdout } = await exec(`ffprobe -i "${videoPath}" -show_streams -select_streams a -loglevel error`);
            return stdout.includes("codec_type=audio");
        } catch (err) {
            console.error("ffprobe error:", err);
            return false;
        }
    }

    private async processVideo(videoPath: string, outputPath: string): Promise<void> {
        try {
            const { stdout } = await exec(
                `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`
            );
            console.log(`Original video dimensions: ${stdout.trim()}`);
        } catch (err) {
            console.error("Error getting video dimensions:", err);
        }

        return await new Promise<void>(async (resolve, reject) => {
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            const hasAudio = await this.videoHasAudio(videoPath);
            console.log("✌️hasAudio --->", hasAudio);

            for (let i = 0; i < 5; i++) {
                const dir = path.join(outputPath, `quality_${i}`);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            }

            let args: string[] = [
                "-i", videoPath,
                "-preset", "medium",
                "-crf", "23",
                "-threads", "2",
            ];

            args = args.concat([
                "-map", "0:v:0", "-c:v:0", "libx264", "-b:v:0", "3000k", "-maxrate:v:0", "3300k",
                "-bufsize:v:0", "6000k", "-vf:v:0", "scale=1920:1080", "-s:v:0", "1920x1080",

                "-map", "0:v:0", "-c:v:1", "libx264", "-b:v:1", "1800k", "-maxrate:v:1", "2000k",
                "-bufsize:v:1", "3600k", "-vf:v:1", "scale=1280:720", "-s:v:1", "1280x720",

                "-map", "0:v:0", "-c:v:2", "libx264", "-b:v:2", "800k", "-maxrate:v:2", "1000k",
                "-bufsize:v:2", "1600k", "-vf:v:2", "scale=842:480", "-s:v:2", "842x480",

                "-map", "0:v:0", "-c:v:3", "libx264", "-b:v:3", "400k", "-maxrate:v:3", "500k",
                "-bufsize:v:3", "800k", "-vf:v:3", "scale=640:360", "-s:v:3", "640x360",
                
                "-map", "0:v:0", "-c:v:4", "libx264", "-b:v:4", "200k", "-maxrate:v:4", "250k",
                "-bufsize:v:4", "400k", "-vf:v:4", "scale=256:144", "-s:v:4", "256x144",
            ]);

            if (hasAudio) {
                args = args.concat([
                    "-map", "0:a:0?", "-c:a:0", "aac", "-b:a:0", "128k",
                    "-map", "0:a:0?", "-c:a:1", "aac", "-b:a:1", "96k",
                    "-map", "0:a:0?", "-c:a:2", "aac", "-b:a:2", "64k",
                    "-map", "0:a:0?", "-c:a:3", "aac", "-b:a:3", "48k",
                    "-map", "0:a:0?", "-c:a:4", "aac", "-b:a:4", "32k",
                ]);

                args.push(
                    "-var_stream_map", "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p v:3,a:3,name:360p v:4,a:4,name:144p"
                );
            } else {
                args.push(
                    "-var_stream_map", "v:0,name:1080p v:1,name:720p v:2,name:480p v:3,name:360p v:4,name:144p"
                );
            }

            args = args.concat([
                "-master_pl_name", "master.m3u8",
                "-f", "hls",
                "-hls_time", "6",
                "-hls_list_size", "0",
                "-hls_segment_type", "mpegts",
                "-hls_playlist_type", "vod",
                "-hls_flags", "independent_segments",
                "-hls_segment_filename", `${outputPath}/quality_%v/segment%03d.ts`,
            ]);

            // Removed unsupported options like '-streaminfo' and '-hls_master_name'.

            args.push(`${outputPath}/quality_%v/playlist.m3u8`);

            console.log("Starting FFmpeg with arguments:", args.join(" "));

            const ffmpeg = spawn("ffmpeg", args, {
                stdio: ["ignore", "pipe", "pipe"],
            });

            let stdoutData = "";
            let stderrData = "";

            ffmpeg.stdout.on("data", (data: Buffer) => {
                const dataStr = data.toString();
                stdoutData += dataStr;
                console.log(`FFmpeg stdout: ${dataStr}`);
            });

            ffmpeg.stderr.on("data", (data: Buffer) => {
                const dataStr = data.toString();
                stderrData += dataStr;
                console.error(`FFmpeg stderr: ${dataStr}`);
            });

            ffmpeg.on("close", (code: number) => {
                if (code === 0) {
                    resolve();
                } else {
                    console.error(`FFmpeg process exited with code ${code}`);
                    console.error("FFmpeg stderr output:", stderrData);
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            const timeout = setTimeout(() => {
                ffmpeg.kill("SIGKILL");
                reject(new Error("FFmpeg process timed out after 4 hours"));
            }, 4 * 60 * 60 * 1000);

            ffmpeg.on("exit", () => clearTimeout(timeout));
        });
    }
}