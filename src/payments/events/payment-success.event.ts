import { Transaction } from '../entities/transaction.entity';

export class PaymentSuccessEvent {
    constructor(
        public readonly transaction: Transaction,
        public readonly userId: string
    ) { }
}
