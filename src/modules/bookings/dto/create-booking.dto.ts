import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-service' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2026-04-05' })
  @IsDateString()
  checkOutDate: string;
}
