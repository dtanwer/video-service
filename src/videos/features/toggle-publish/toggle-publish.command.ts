export class TogglePublishCommand {
    constructor(
        public readonly videoId: string,
        public readonly userId: string,
        public readonly isPublished: boolean,
    ) { }
}
