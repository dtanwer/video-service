import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { ContentAccessGuard } from '../auth/guards/content-access.guard';

@Controller('live')
export class MediaController {
    private readonly baseDir = join(process.cwd(), 'uploads', 'live');

    @Get(':streamKey/:filename')
    @UseGuards(ContentAccessGuard)
    serveFile(
        @Param('streamKey') streamKey: string,
        @Param('filename') filename: string,
        @Res() res: Response,
    ) {
        const filePath = join(this.baseDir, streamKey, filename);

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        // Set appropriate headers
        if (filename.endsWith('.m3u8')) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (filename.endsWith('.ts')) {
            res.setHeader('Content-Type', 'video/MP2T');
        }

        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
    }

    // Handle nested quality directories if needed (e.g. /live/streamKey/1080p/index.m3u8)
    @Get(':streamKey/:quality/:filename')
    @UseGuards(ContentAccessGuard)
    serveVariantFile(
        @Param('streamKey') streamKey: string,
        @Param('quality') quality: string,
        @Param('filename') filename: string,
        @Res() res: Response,
    ) {
        const filePath = join(this.baseDir, streamKey, quality, filename);

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        if (filename.endsWith('.m3u8')) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (filename.endsWith('.ts')) {
            res.setHeader('Content-Type', 'video/MP2T');
        }

        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
    }
}
