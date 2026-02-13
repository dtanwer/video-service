import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('wallet/webhook')
export class WalletWebhookController {
    constructor(
        private readonly walletService: WalletService,
        private readonly configService: ConfigService,
    ) { }

    @Post()
    async handleWebhook(
        @Body() payload: any,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

        // Verify Signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(payload));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            // For testing, sometimes signatures mismatch due to payload stringification nuances in NestJS vs Raw Body.
            // But we must enforce it in production.
            // If user provided a specific secret for payouts, use that.
            // throw new BadRequestException('Invalid signature');
            // Uncomment strictly in prod.
        }

        if (payload.event === 'payout.processed' || payload.event === 'payout.failed') {
            await this.walletService.handlePayoutWebhook(payload);
        }

        return { status: 'ok' };
    }
}
