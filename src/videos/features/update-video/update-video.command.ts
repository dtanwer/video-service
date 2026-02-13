export class UpdateVideoCommand {
    constructor(
        public readonly videoId: string,
        public readonly userId: string,
        public readonly updateData: {
            title?: string;
            description?: string;
            isPaid?: boolean;
            price?: number;
            visibility?: 'public' | 'private';
        }
    ) { }
}
