import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { TransactionType } from '../../entities/transaction.entity';
import { CreateOrderCommand } from './create-order.command';

@Controller('payments')
export class CreateOrderController {
    constructor(private readonly commandBus: CommandBus) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-order')
    async createOrder(@Request() req, @Body() body: { type: TransactionType; referenceId?: string }) {
        return this.commandBus.execute(
            new CreateOrderCommand(req.user.id, body.type, body.referenceId)
        );
    }
}
