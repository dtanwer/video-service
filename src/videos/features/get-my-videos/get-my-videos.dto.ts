import { IsInt, IsOptional, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { VideoEncoderStatus } from '../../entity/enums/video-encoder-status';

export class GetMyVideosDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(VideoEncoderStatus)
    status?: VideoEncoderStatus;

    @IsOptional()
    @IsString()
    visibility?: 'public' | 'private';
}
