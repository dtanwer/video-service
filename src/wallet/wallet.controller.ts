import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport'; // Assuming JWT Auth Guard exists
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@Request() req) {
        return this.walletService.getWallet(req.user.id);
    }

    @Get('transactions')
    async getTransactions(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.walletService.getTransactions(req.user.id, Number(page), Number(limit));
    }

    @Post('withdraw')
    async withdraw(@Request() req, @Body('amount') amount: number) {
        if (!amount || amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }
        // We will initiate the Razorpay payout here in the future
        // For now, we just lock the funds
        return this.walletService.requestWithdrawal(req.user.id, amount);
    }
}
