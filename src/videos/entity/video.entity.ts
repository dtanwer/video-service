import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/user.entity';
import { VideoEncoderStatus } from './enums/video-encoder-status';
import { Tag } from './tag.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @Column({ nullable: true })
  durationSeconds: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.videos, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Tag, (tag) => tag.videos, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @Column({ default: false })
  isLive: boolean;

  @Column({
    type: 'enum',
    enum: VideoEncoderStatus,
    default: VideoEncoderStatus.PENDING
  })
  status: VideoEncoderStatus;

  @Column({ nullable: true })
  streamKey: string;

  @Column({ nullable: true })
  rtmpUrl: string;

  @Column({ nullable: true })
  playbackUrl: string;

  @Column({ default: false })
  isPublished: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
} 