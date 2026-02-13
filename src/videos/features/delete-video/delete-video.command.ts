export class DeleteVideoCommand {
    constructor(
        public readonly videoId: string,
        public readonly userId: string,
    ) { }
}
