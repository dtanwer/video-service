import { Controller, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UpdateVideoDto } from './update-video.dto';
import { UpdateVideoCommand } from './update-video.command';

@Controller('videos')
export class UpdateVideoController {
    constructor(private readonly commandBus: CommandBus) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateVideoDto: UpdateVideoDto,
        @Request() req,
    ) {
        return this.commandBus.execute(
            new UpdateVideoCommand(id, req.user.id, updateVideoDto),
        );
    }
}
