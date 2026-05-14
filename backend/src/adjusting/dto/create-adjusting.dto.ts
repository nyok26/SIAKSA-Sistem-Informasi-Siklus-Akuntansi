import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** A single debit or credit line on an adjusting entry */
export class AdjustingDetailDto {
  @IsUUID('4', { message: 'account_id must be a valid UUID' })
  account_id: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0, { message: 'Debit amount cannot be negative' })
  debit: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0, { message: 'Credit amount cannot be negative' })
  credit: number;
}

export class CreateAdjustingDto {
  @IsDateString({}, { message: 'date must be a valid ISO date string (YYYY-MM-DD)' })
  date: string;

  @IsString()
  @MinLength(1, { message: 'Description is required' })
  description: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'An adjusting entry must have at least 2 lines' })
  @ValidateNested({ each: true })
  @Type(() => AdjustingDetailDto)
  details: AdjustingDetailDto[];
}
