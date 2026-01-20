import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../auth/guards/optional-jwt-auth.guard';
import { VideoAccessGuard } from '../../guards/video-access.guard';
import { VideoAccessService } from '../../services/video-access.service';

@ApiTags('Videos')
@Controller('videos')
export class GetSignedUrlController {
    constructor(private readonly videoAccessService: VideoAccessService) { }

    @Get(':id/signed-url')
    @UseGuards(OptionalJwtAuthGuard, VideoAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get signed URL for video playback' })
    @ApiResponse({ status: 200, description: 'Returns the signed URL' })
    @ApiResponse({ status: 403, description: 'Forbidden if user does not have access' })
    @ApiResponse({ status: 404, description: 'Video not found' })
    async getSignedUrl(@Request() req, @Param('id') id: string) {
        const video = req.video; // Attached by VideoAccessGuard
        const userId = req.user?.id;

        const url = this.videoAccessService.generateSignedUrl(video, userId);

        return { url };
    }
}
