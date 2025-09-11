import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum VideoEncoderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity()
export class VideoEncoder  {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    videoId: string;

    @Column({
        type: 'enum',
        enum: VideoEncoderStatus,
        default: VideoEncoderStatus.PENDING,
    }) 
    status: VideoEncoderStatus;

    @Column({ nullable: true })
    error: string;

    @Column()
    fileUrl: string;

    @Column({ default: false })
    isCompleted: boolean;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
