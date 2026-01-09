import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreatePlaylistDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isPaid?: boolean;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsUUID('4', { each: true })
    @IsOptional()
    videoIds?: string[];
}
