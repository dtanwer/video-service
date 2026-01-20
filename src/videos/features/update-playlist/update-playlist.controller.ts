import { Controller, Patch, Param, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdatePlaylistDto } from './update-playlist.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UpdatePlaylistCommand } from './update-playlist.command';

function editFileName(req, file, callback) {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(8)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
}

@Controller('playlists')
export class UpdatePlaylistController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/playlists',
                filename: editFileName,
            }),
        }),
    )
    update(@Request() req, @Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto, @UploadedFile() file: any) {
        if (file) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            updatePlaylistDto.image = `${baseUrl}/uploads/playlists/${file.filename}`;
        }
        return this.commandBus.execute(new UpdatePlaylistCommand(id, updatePlaylistDto, req.user.id));
    }
}
