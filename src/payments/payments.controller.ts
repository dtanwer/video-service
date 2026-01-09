import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionType } from './entities/transaction.entity';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-order')
    async createOrder(@Request() req, @Body() body: { type: TransactionType; referenceId?: string }) {
        return this.paymentsService.createOrder(req.user.id, body.type, body.referenceId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify')
    async verifyPayment(
        @Request() req,
        @Body() body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
    ) {
        return this.paymentsService.verifyPayment(
            req.user.id,
            body.razorpayOrderId,
            body.razorpayPaymentId,
            body.razorpaySignature,
        );
    }
}
