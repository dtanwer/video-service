import { Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Video } from './videos/entity/video.entity';
import { VideoEncoder } from './video-encoder/entities/video-encoder.entity';
import { Tag } from './videos/entity/tag.entity';
import { Playlist } from './playlists/entities/playlist.entity';
import { Transaction } from './payments/entities/transaction.entity';

@Module({
  imports: [
    NestTypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'youtube',
      entities: [User, Video, VideoEncoder, Tag, Playlist, Transaction],
      synchronize: true, // Set to false in production
      // logging: true,
    }),
  ],
})
export class TypeOrmModule { }
