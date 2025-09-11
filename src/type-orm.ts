import { Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Video } from './videos/entity/video.entity';
import { VideoEncoder } from './video-encoder/entities/video-encoder.entity';

@Module({
  imports: [
    NestTypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port:  5432,
      username: 'postgres',
      password: 'postgres',
      database: 'youtube_auth',
      entities: [User, Video,VideoEncoder],
      synchronize: true, // Set to false in production
    }),
  ],
})
export class TypeOrmModule {}
