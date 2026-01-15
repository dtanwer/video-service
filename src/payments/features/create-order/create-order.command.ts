import { ICommand } from '@nestjs/cqrs';
import { TransactionType } from '../../entities/transaction.entity';

export class CreateOrderCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly type: TransactionType,
        public readonly referenceId?: string
    ) { }
}
