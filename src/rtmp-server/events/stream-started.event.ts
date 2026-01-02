export class StreamStartedEvent {
    constructor(
        public readonly streamKey: string,
        public readonly playbackUrl:string

    ) { }
}
