import { IsString, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { Category, NormalBalance } from '@prisma/client';

export class CreateAccountDto {
  /**
   * Account code — must match the category prefix:
   *   1xxx = Assets | 2xxx = Liabilities | 3xxx = Equity
   *   4xxx = Revenue | 5xxx = Expenses
   */
  @IsString()
  @MinLength(2, { message: 'Account code must be at least 2 characters' })
  @MaxLength(10, { message: 'Account code must not exceed 10 characters' })
  @Matches(/^[1-5]\d+$/, {
    message: 'Account code must start with 1–5 and contain only digits',
  })
  account_code: string;

  @IsString()
  @MinLength(2, { message: 'Account name must be at least 2 characters' })
  @MaxLength(100, { message: 'Account name must not exceed 100 characters' })
  account_name: string;

  @IsEnum(Category, {
    message: 'Category must be one of: Assets, Liabilities, Equity, Revenue, Expenses',
  })
  category: Category;

  @IsEnum(NormalBalance, {
    message: 'Normal balance must be either Debit or Credit',
  })
  normal_balance: NormalBalance;
}
