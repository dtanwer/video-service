import { ICommand } from '@nestjs/cqrs';
import { CreatePlaylistDto } from './create-playlist.dto';
import { User } from '../../../users/user.entity';

export class CreatePlaylistCommand implements ICommand {
    constructor(
        public readonly createPlaylistDto: CreatePlaylistDto,
        public readonly user: User
    ) { }
}
