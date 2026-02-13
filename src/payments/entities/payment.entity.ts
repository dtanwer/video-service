import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

@Entity('payments') // This table records the commission split
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    orderId: string; // Razorpay Order ID

    @Column({ nullable: true })
    paymentId: string; // Razorpay Payment ID

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    adminCommission: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    creatorAmount: number;

    @Column({ type: 'uuid' })
    creatorId: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
