import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ example: 'Deluxe King Room' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Spacious room with ocean view and king bed.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 199.99 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'https://example.com/room.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
