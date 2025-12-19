import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { StartLiveStreamCommand } from './start-live-stream.command';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

class StartLiveStreamDto {
    title?: string;
    description?: string;
}

@ApiTags('videos')
@Controller('videos')
export class StartLiveStreamController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('live')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Start a live stream' })
    @ApiBody({ type: StartLiveStreamDto })
    async startLiveStream(@Request() req, @Body() dto: StartLiveStreamDto) {
        return this.commandBus.execute(
            new StartLiveStreamCommand(req.user.userId, dto.title, dto.description),
        );
    }
}
