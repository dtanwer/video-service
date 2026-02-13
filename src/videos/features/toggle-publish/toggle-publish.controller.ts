import { Controller, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { TogglePublishDto } from './toggle-publish.dto';
import { TogglePublishCommand } from './toggle-publish.command';

@Controller('videos')
export class TogglePublishController {
    constructor(private readonly commandBus: CommandBus) { }

    @Patch(':id/publish')
    @UseGuards(JwtAuthGuard)
    async togglePublish(
        @Param('id') id: string,
        @Body() togglePublishDto: TogglePublishDto,
        @Request() req,
    ) {
        return this.commandBus.execute(
            new TogglePublishCommand(id, req.user.id, togglePublishDto.isPublished),
        );
    }
}
