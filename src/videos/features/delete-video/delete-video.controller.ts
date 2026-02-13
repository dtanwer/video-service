import { Controller, Delete, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { DeleteVideoCommand } from './delete-video.command';

@Controller('videos')
export class DeleteVideoController {
    constructor(private readonly commandBus: CommandBus) { }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id') id: string,
        @Request() req,
    ) {
        await this.commandBus.execute(
            new DeleteVideoCommand(id, req.user.id),
        );
    }
}
