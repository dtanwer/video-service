import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entity/video.entity';
import { GetVideoQuery } from './get-video.query';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Transaction, TransactionType, TransactionStatus } from '../../../payments/entities/transaction.entity';
import { User } from '../../../users/user.entity';

@QueryHandler(GetVideoQuery)
export class GetVideoHandler implements IQueryHandler<GetVideoQuery> {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    get baseUrl() {
        return this.configService.get<string>('BASE_URL');
    }

    async execute(query: GetVideoQuery) {
        const { videoId, userId } = query;
        const video = await this.videoRepository.findOne({
            where: { id: videoId },
            relations: ['user'],
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        let hasAccess = false;
        let playbackUrl = null;

        // 1. Check if video is free and public
        if (!video.isPaid && !video.isSubscriptionOnly) {
            hasAccess = true;
        }

        // 2. Check if user is owner
        if (userId && video.userId === userId) {
            hasAccess = true;
        }

        // 3. Check if user has purchased or subscribed
        if (!hasAccess && userId) {
            const user = await this.userRepository.findOne({ where: { id: userId } });

            // Check Subscription
            if (video.isSubscriptionOnly || video.isPaid) {
                if (user.subscriptionPlan !== 'FREE' && user.subscriptionExpiry && user.subscriptionExpiry > new Date()) {
                    hasAccess = true;
                }
            }

            // Check One-time Purchase
            if (!hasAccess && video.isPaid) {
                const purchase = await this.transactionRepository.findOne({
                    where: {
                        userId,
                        referenceId: videoId,
                        type: TransactionType.VIDEO_PURCHASE,
                        status: TransactionStatus.SUCCESS,
                    },
                });
                if (purchase) {
                    hasAccess = true;
                }
            }
        }

        if (hasAccess && video.playbackUrl) {
            // Generate Signed URL
            const token = this.jwtService.sign({
                userId: userId || 'public',
                videoId: video.id,
            });

            // Append token to existing query params or start new ones
            const separator = video.playbackUrl.includes('?') ? '&' : '?';
            playbackUrl = `${video.playbackUrl}${separator}token=${token}`;
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
