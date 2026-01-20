import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Video } from '../entity/video.entity';
import { User } from '../../users/user.entity';
import { Transaction, TransactionType, TransactionStatus } from '../../payments/entities/transaction.entity';

@Injectable()
export class VideoAccessService {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    async checkAccess(userId: string | undefined, videoId: string): Promise<{ hasAccess: boolean; video: Video }> {
        const video = await this.videoRepository.findOne({
            where: { id: videoId },
            relations: ['user'],
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        let hasAccess = false;

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

            if (user) {
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
        }

        return { hasAccess, video };
    }

    generateSignedUrl(video: Video, userId: string | undefined): string | null {
        if (!video.playbackUrl) {
            return null;
        }

        const token = this.jwtService.sign({
            userId: userId || 'public',
            videoId: video.id,
        });

        const separator = video.playbackUrl.includes('?') ? '&' : '?';
        return `${video.playbackUrl}${separator}token=${token}`;
    }
}
