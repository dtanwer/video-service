import { Module } from '@nestjs/common';
import { UploadVideoModule } from './upload-video/upload-video.module';
import { ListVideoModule } from './list-video/list-video.module';
import { GetVideoModule } from './get-video/get-video.module';
import { ListTagsModule } from './list-tags/list-tags.module';
import { StartLiveStreamModule } from './start-live-stream/start-live-stream.module';
import { CqrsModule } from '@nestjs/cqrs';
import { VideoEncodingStartedHandler } from '../entity/event/video-encoding-started/video-encoding-started.handler';
import { VideoEncodingCompletedHandler } from '../entity/event/video-encoding-completed/video-encoding-completed.handler';
import { VideoEncodingFailedHandler } from '../entity/event/video-encoding-failed/video-encoding-failed.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../entity/video.entity';
import { Playlist } from '../entity/playlist.entity';

import { CreatePlaylistController } from './create-playlist/create-playlist.controller';
import { UpdatePlaylistController } from './update-playlist/update-playlist.controller';
import { DeletePlaylistController } from './delete-playlist/delete-playlist.controller';
import { AddVideoToPlaylistController } from './add-video-to-playlist/add-video-to-playlist.controller';
import { RemoveVideoFromPlaylistController } from './remove-video-from-playlist/remove-video-from-playlist.controller';
import { GetPlaylistController } from './get-playlist/get-playlist.controller';

import { CreatePlaylistHandler } from './create-playlist/create-playlist.handler';
import { UpdatePlaylistHandler } from './update-playlist/update-playlist.handler';
import { DeletePlaylistHandler } from './delete-playlist/delete-playlist.handler';
import { AddVideoToPlaylistHandler } from './add-video-to-playlist/add-video-to-playlist.handler';
import { RemoveVideoFromPlaylistHandler } from './remove-video-from-playlist/remove-video-from-playlist.handler';
import { GetPlaylistHandler } from './get-playlist/get-playlist.handler';
import { GetPlaylistsHandler } from './get-playlist/get-playlists.handler';

@Module({
  imports: [
    UploadVideoModule,
    ListVideoModule,
    GetVideoModule,
    ListTagsModule,
    StartLiveStreamModule,
    CqrsModule,
    TypeOrmModule.forFeature([Video, Playlist]),
  ],
  providers: [
    VideoEncodingStartedHandler,
    VideoEncodingCompletedHandler,
    VideoEncodingFailedHandler,
    CreatePlaylistHandler,
    UpdatePlaylistHandler,
    DeletePlaylistHandler,
    AddVideoToPlaylistHandler,
    RemoveVideoFromPlaylistHandler,
    GetPlaylistHandler,
    GetPlaylistsHandler,
  ],
  controllers: [
    CreatePlaylistController,
    UpdatePlaylistController,
    DeletePlaylistController,
    AddVideoToPlaylistController,
    RemoveVideoFromPlaylistController,
    GetPlaylistController,
  ],
})
export class VideosModule { } 