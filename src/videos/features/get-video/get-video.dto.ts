import { IsUUID } from 'class-validator';

export class GetVideoDto {
    @IsUUID()
    videoId: string;
}
