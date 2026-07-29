import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

enum LoanSortBy {
	createdAt = "createdAt",
	remaining = "remaining",
	principal = "principal",
}

enum SortOrder {
	asc = "asc",
	desc = "desc",
}

export class CreateLoanDto {
	@ApiProperty({ example: "account-uuid", description: "Account ID (must be type LOAN)" })
	@IsString()
	@IsNotEmpty()
	accountId!: string;

	@ApiProperty({ example: 200000, description: "Loan principal amount" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	principal!: number;

	@ApiProperty({ example: 0.15, description: "Annual interest rate as decimal (0.15 = 15%)" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	interestRate!: number;

	@ApiProperty({ example: 36, description: "Loan term in months" })
	@Type(() => Number)
	@IsInt()
	@Min(1)
	termMonths!: number;

	@ApiProperty({ example: "2026-01-15T00:00:00.000Z", description: "Loan start date" })
	@IsDateString()
	startDate!: string;

	@ApiProperty({ example: 6800, description: "Monthly payment amount" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	monthlyPayment!: number;

	@ApiPropertyOptional({
		example: 185000,
		description: "Remaining balance (defaults to principal)",
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	remaining?: number;
}

export class UpdateLoanDto {
	@ApiPropertyOptional({ example: 0.15, description: "Annual interest rate as decimal" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	interestRate?: number;

	@ApiPropertyOptional({ example: 36, description: "Loan term in months" })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	termMonths?: number;

	@ApiPropertyOptional({ example: 6800, description: "Monthly payment amount" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	monthlyPayment?: number;

	@ApiPropertyOptional({ example: 180000, description: "Remaining balance" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	remaining?: number;
}

export class LoanResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Loan ID" })
	id!: string;

	@ApiProperty({ example: "account-uuid", description: "Associated account ID" })
	accountId!: string;

	@ApiProperty({ example: 200000, description: "Loan principal amount" })
	principal!: number;

	@ApiProperty({ example: 0.15, description: "Annual interest rate as decimal" })
	interestRate!: number;

	@ApiProperty({ example: 36, description: "Loan term in months" })
	termMonths!: number;

	@ApiProperty({ example: "2026-01-15T00:00:00.000Z", description: "Loan start date" })
	startDate!: Date;

	@ApiProperty({ example: 6800, description: "Monthly payment amount" })
	monthlyPayment!: number;

	@ApiProperty({ example: 185000, description: "Remaining balance" })
	remaining!: number;

	@ApiProperty({ example: "2026-07-28T20:00:00.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-28T20:00:00.000Z", description: "Last update date" })
	updatedAt!: Date;
}

export class QueryLoansDto {
	@ApiPropertyOptional({
		enum: LoanSortBy,
		example: "createdAt",
		default: "createdAt",
		description: "Sort field",
	})
	@IsOptional()
	@IsEnum(LoanSortBy)
	sortBy?: LoanSortBy;

	@ApiPropertyOptional({
		enum: SortOrder,
		example: "desc",
		default: "desc",
		description: "Sort order",
	})
	@IsOptional()
	@IsEnum(SortOrder)
	order?: SortOrder;
}
