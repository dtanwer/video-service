import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { User } from './users/user.entity';
import { Video } from './videos/entity/video.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { VideosModule } from './videos/features/videos.module';
import { VideoEncoderModule } from './video-encoder/video-encoder.module';
import { VideoEncoder } from './video-encoder/entities/video-encoder.entity';


@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port:  5432,
      username: 'postgres',
      password: 'postgres',
      database: 'youtube_auth',
      entities: [User, Video,VideoEncoder],
      synchronize: true, // Set to false in production
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    VideosModule,
    VideoEncoderModule
  ],
})
export class AppModule {}