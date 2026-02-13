import { VideoEncoderStatus } from '../../entity/enums/video-encoder-status';

export class GetMyVideosQuery {
    constructor(
        public readonly userId: string,
        public readonly page: number,
        public readonly limit: number,
        public readonly search?: string,
        public readonly status?: VideoEncoderStatus,
        public readonly visibility?: 'public' | 'private',
    ) { }
}
