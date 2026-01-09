import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from './entities/playlist.entity';
import { Video } from '../videos/entity/video.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, Video, User])],
    controllers: [PlaylistsController],
    providers: [PlaylistsService],
    exports: [PlaylistsService],
})
export class PlaylistsModule { }
