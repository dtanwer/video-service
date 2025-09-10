import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @Column()
    updatedAt: Date;

    @Column()
    createdAt: Date;
}
