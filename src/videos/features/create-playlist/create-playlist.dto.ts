import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreatePlaylistDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    isPaid?: boolean;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    price?: number;

    @IsUUID('4', { each: true })
    @IsOptional()
    videoIds?: string[];
}
