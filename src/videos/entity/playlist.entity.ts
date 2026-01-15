import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Video } from '../../videos/entity/video.entity';

@Entity('playlists')
export class Playlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    isPaid: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    @Column({ type: 'uuid' })
    ownerId: string;

    @ManyToMany(() => Video)
    @JoinTable()
    videos: Video[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
