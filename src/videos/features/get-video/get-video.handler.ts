import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { VideoAccessService } from '../../services/video-access.service';
import { GetVideoQuery } from './get-video.query';
import { ConfigService } from '@nestjs/config';

@QueryHandler(GetVideoQuery)
export class GetVideoHandler implements IQueryHandler<GetVideoQuery> {
    constructor(
        private readonly configService: ConfigService,
        private readonly videoAccessService: VideoAccessService,
    ) { }

    get baseUrl() {
        return this.configService.get<string>('BASE_URL');
    }

    async execute(query: GetVideoQuery) {
        const { videoId, userId } = query;

        const { hasAccess, video } = await this.videoAccessService.checkAccess(userId, videoId);

        let playbackUrl = null;
        if (hasAccess && video.playbackUrl) {
            playbackUrl = this.videoAccessService.generateSignedUrl(video, userId);
        }

        return {
            id: video.id,
            title: video.title,
            description: video.description,
            sizeBytes: video.sizeBytes,
            durationSeconds: video.durationSeconds,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt,
            url: playbackUrl,
            hasAccess,
            isPaid: video.isPaid,
            price: video.price,
            isSubscriptionOnly: video.isSubscriptionOnly,
            status: video.status,
            thumbnail: `${this.baseUrl}/uploads/videos/hls/${video.id}/thumbnail.jpg`,
            user: video.user
                ? {
                    id: video.user.id,
                    name: video.user.name,
                    avatar: video.user.avatar,
                }
                : null,
        };
    }
}
