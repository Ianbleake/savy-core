import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from "class-validator";

enum TransactionType {
	INCOME = "INCOME",
	EXPENSE = "EXPENSE",
	TRANSFER = "TRANSFER",
	PAYMENT = "PAYMENT",
}

export class CreateTransactionDto {
	@ApiProperty({ example: "account-uuid", description: "Source account ID (where money leaves)" })
	@IsString()
	@IsNotEmpty()
	accountId!: string;

	@ApiPropertyOptional({
		example: "destination-uuid",
		description: "Destination account ID (required for TRANSFER and PAYMENT, null for INCOME/EXPENSE)",
	})
	@IsOptional()
	@IsString()
	destinationAccountId?: string | null;

	@ApiPropertyOptional({
		example: "category-uuid",
		description: "Category ID (optional, for INCOME/EXPENSE categorization)",
	})
	@IsOptional()
	@IsString()
	categoryId?: string;

	@ApiProperty({
		enum: TransactionType,
		example: "EXPENSE",
		description: "Transaction type",
	})
	@IsEnum(TransactionType)
	type!: TransactionType;

	@ApiProperty({ example: 1500.0, description: "Transaction amount" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount!: number;

	@ApiPropertyOptional({ example: "Grocery shopping", description: "Short description" })
	@IsOptional()
	@IsString()
	@MaxLength(200)
	description?: string;

	@ApiPropertyOptional({ example: "Weekly groceries at Walmart", description: "Detailed note" })
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	note?: string;

	@ApiPropertyOptional({ example: "2026-07-28T12:00:00.000Z", description: "Transaction date (defaults to now)" })
	@IsOptional()
	@IsDateString()
	date?: string;
}

export class UpdateTransactionDto {
	@ApiPropertyOptional({ example: "account-uuid", description: "Source account ID" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	accountId?: string;

	@ApiPropertyOptional({ example: "destination-uuid", description: "Destination account ID" })
	@IsOptional()
	@IsString()
	destinationAccountId?: string | null;

	@ApiPropertyOptional({ example: "category-uuid", description: "Category ID" })
	@IsOptional()
	@IsString()
	categoryId?: string | null;

	@ApiPropertyOptional({ enum: TransactionType, example: "EXPENSE", description: "Transaction type" })
	@IsOptional()
	@IsEnum(TransactionType)
	type?: TransactionType;

	@ApiPropertyOptional({ example: 1500.0, description: "Transaction amount" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount?: number;

	@ApiPropertyOptional({ example: "Grocery shopping", description: "Short description" })
	@IsOptional()
	@IsString()
	@MaxLength(200)
	description?: string;

	@ApiPropertyOptional({ example: "Weekly groceries at Walmart", description: "Detailed note" })
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	note?: string;

	@ApiPropertyOptional({ example: "2026-07-28T12:00:00.000Z", description: "Transaction date" })
	@IsOptional()
	@IsDateString()
	date?: string;
}

export class TransactionResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Transaction ID" })
	id!: string;

	@ApiProperty({ example: "account-uuid", description: "Source account ID" })
	accountId!: string;

	@ApiPropertyOptional({ example: "destination-uuid", description: "Destination account ID (TRANSFER/PAYMENT only)" })
	destinationAccountId!: string | null;

	@ApiPropertyOptional({ example: "category-uuid", description: "Category ID" })
	categoryId!: string | null;

	@ApiProperty({ enum: TransactionType, example: "EXPENSE", description: "Transaction type" })
	type!: TransactionType;

	@ApiProperty({ example: 1500.0, description: "Transaction amount" })
	amount!: number;

	@ApiPropertyOptional({ example: "Grocery shopping", description: "Short description" })
	description!: string | null;

	@ApiPropertyOptional({ example: "Weekly groceries at Walmart", description: "Detailed note" })
	note!: string | null;

	@ApiProperty({ example: "2026-07-28T12:00:00.000Z", description: "Transaction date" })
	date!: Date;

	@ApiProperty({ example: "2026-07-28T12:00:00.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-28T12:00:00.000Z", description: "Last update date" })
	updatedAt!: Date;
}