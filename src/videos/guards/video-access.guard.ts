import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { VideoAccessService } from '../services/video-access.service';

@Injectable()
export class VideoAccessGuard implements CanActivate {
    constructor(private readonly videoAccessService: VideoAccessService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const videoId = request.params.id || request.params.videoId;
        const user = request.user;

        if (!videoId) {
            throw new BadRequestException('Video ID is required');
        }

        const { hasAccess, video } = await this.videoAccessService.checkAccess(user?.id, videoId);

        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this video');
        }

        // Attach video to request for controller use
        request.video = video;
        return true;
    }
}
