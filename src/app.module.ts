import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { RtmpServerModule } from './rtmp-server/rtmp-server.module';
import { TypeOrmModule } from './type-orm';
import { UsersModule } from './users/users.module';
import { VideoEncoderModule } from './video-encoder/video-encoder.module';
import { VideosModule } from './videos/features/videos.module';


@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    VideosModule,
    VideoEncoderModule,
    RtmpServerModule
  ],
})
export class AppModule { }