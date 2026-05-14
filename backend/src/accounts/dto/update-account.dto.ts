import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Category, NormalBalance } from '@prisma/client';

/** All fields are optional for PATCH requests */
export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Matches(/^[1-5]\d+$/, {
    message: 'Account code must start with 1–5 and contain only digits',
  })
  account_code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  account_name?: string;

  @IsOptional()
  @IsEnum(Category, {
    message: 'Category must be one of: Assets, Liabilities, Equity, Revenue, Expenses',
  })
  category?: Category;

  @IsOptional()
  @IsEnum(NormalBalance, {
    message: 'Normal balance must be either Debit or Credit',
  })
  normal_balance?: NormalBalance;
}
