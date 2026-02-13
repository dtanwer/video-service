import { IsString, IsOptional, IsNumber, IsBoolean, IsIn } from 'class-validator';

export class UpdateVideoDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isPaid?: boolean;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    @IsIn(['public', 'private'])
    visibility?: 'public' | 'private';
}
