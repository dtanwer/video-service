import { ICommand } from '@nestjs/cqrs';

export class VerifyPaymentCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly razorpayOrderId: string,
        public readonly razorpayPaymentId: string,
        public readonly razorpaySignature: string
    ) { }
}
