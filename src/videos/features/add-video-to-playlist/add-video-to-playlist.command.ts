import { ICommand } from '@nestjs/cqrs';

export class AddVideoToPlaylistCommand implements ICommand {
    constructor(
        public readonly playlistId: string,
        public readonly videoId: string,
        public readonly userId: string
    ) { }
}
