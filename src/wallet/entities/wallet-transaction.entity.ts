import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum WalletTransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
}

export enum WalletTransactionsubType {
    EARNING = 'EARNING',
    WITHDRAWAL = 'WITHDRAWAL',
    REFUND = 'REFUND',
}

export enum WalletTransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

@Entity('wallet_transactions')
export class WalletTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
    wallet: Wallet;

    @Column({ type: 'uuid' })
    walletId: string;

    @Column({
        type: 'enum',
        enum: WalletTransactionType,
    })
    type: WalletTransactionType;

    @Column({
        type: 'enum',
        enum: WalletTransactionsubType,
    })
    subType: WalletTransactionsubType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    referenceId: string; // PaymentID or PayoutID

    @Column({
        type: 'enum',
        enum: WalletTransactionStatus,
        default: WalletTransactionStatus.PENDING,
    })
    status: WalletTransactionStatus;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn()
    createdAt: Date;
}
