import { ICommand } from '@nestjs/cqrs';
import { UpdatePlaylistDto } from './update-playlist.dto';

export class UpdatePlaylistCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly updatePlaylistDto: UpdatePlaylistDto,
        public readonly userId: string
    ) { }
}
