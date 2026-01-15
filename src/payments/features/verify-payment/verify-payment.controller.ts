import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { VerifyPaymentCommand } from './verify-payment.command';

@Controller('payments')
export class VerifyPaymentController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Post('verify')
    async verifyPayment(
        @Request() req,
        @Body() body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
    ) {
        return this.commandBus.execute(
            new VerifyPaymentCommand(
                req.user.id,
                body.razorpayOrderId,
                body.razorpayPaymentId,
                body.razorpaySignature
            )
        );
    }
}
