import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum PayoutStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    FAILED = 'FAILED',
}

@Entity('payouts')
export class Payout {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
    wallet: Wallet;

    @Column({ type: 'uuid' })
    walletId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    razorpayPayoutId: string;

    @Column({ nullable: true })
    failureReason: string;

    @Column({
        type: 'enum',
        enum: PayoutStatus,
        default: PayoutStatus.PENDING,
    })
    status: PayoutStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
