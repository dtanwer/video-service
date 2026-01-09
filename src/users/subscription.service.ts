import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSubscriptionExpiry() {
        this.logger.log('Checking for expired subscriptions...');

        const now = new Date();
        const result = await this.userRepository.update(
            {
                subscriptionExpiry: LessThan(now),
                subscriptionPlan: 'PREMIUM', // Or BASIC, or Not('FREE')
            },
            {
                subscriptionPlan: 'FREE',
                subscriptionExpiry: null,
            }
        );

        // Also handle BASIC if separate query needed or use IN
        await this.userRepository.update(
            {
                subscriptionExpiry: LessThan(now),
                subscriptionPlan: 'BASIC',
            },
            {
                subscriptionPlan: 'FREE',
                subscriptionExpiry: null,
            }
        );

        this.logger.log(`Expired ${result.affected} subscriptions.`);
    }
}
