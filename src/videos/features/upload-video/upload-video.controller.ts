import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UploadVideoCommand } from './upload-video.command';

function editFileName(req, file, callback) {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(8)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
}

@Controller('video')
export class UploadVideoController {
  constructor(private readonly commandBus: CommandBus) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: editFileName,
      }),
      limits: { fileSize: 1024 * 1024 * 1024 },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: any,
    @Body('title') title?: string,
    @Body('description') description?: string,
    @Body('tags') tags?: string[],
    @Req() req?: any,
  ) {
    const command = new UploadVideoCommand({
      file,
      title,
      description,
      userId: req?.user?.id,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      sizeBytes: Number(file.size),
      tags: tags,
    });

    await this.commandBus.execute(command);
    return "Video uploaded successfully";
  }
} 