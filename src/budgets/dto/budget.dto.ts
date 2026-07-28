import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

enum BudgetPeriod {
	WEEKLY = "WEEKLY",
	BIWEEKLY = "BIWEEKLY",
	MONTHLY = "MONTHLY",
	YEARLY = "YEARLY",
}

export class CreateBudgetDto {
	@ApiProperty({ example: "category-uuid", description: "Category ID (must be EXPENSE type)" })
	@IsString()
	@IsNotEmpty()
	categoryId!: string;

	@ApiProperty({ example: 5000, description: "Budget amount for the period" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount!: number;

	@ApiProperty({
		enum: BudgetPeriod,
		example: "MONTHLY",
		description: "Budget period",
	})
	@IsEnum(BudgetPeriod)
	period!: BudgetPeriod;

	@ApiProperty({ example: "2026-01-15T00:00:00.000Z", description: "Start date of the first cycle" })
	@IsDateString()
	startDate!: string;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z", description: "Optional end date for temporary budgets" })
	@IsOptional()
	@IsDateString()
	endDate?: string;
}

export class UpdateBudgetDto {
	@ApiPropertyOptional({ example: "category-uuid", description: "Category ID (must be EXPENSE type)" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	categoryId?: string;

	@ApiPropertyOptional({ example: 5000, description: "Budget amount for the period" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount?: number;

	@ApiPropertyOptional({ enum: BudgetPeriod, example: "MONTHLY", description: "Budget period" })
	@IsOptional()
	@IsEnum(BudgetPeriod)
	period?: BudgetPeriod;

	@ApiPropertyOptional({ example: "2026-01-15T00:00:00.000Z", description: "Start date of the first cycle" })
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z", description: "Optional end date" })
	@IsOptional()
	@IsDateString()
	endDate?: string;
}

export class BudgetResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Budget ID" })
	id!: string;

	@ApiProperty({ example: "profile-uuid", description: "Owner profile ID" })
	profileId!: string;

	@ApiProperty({ example: "category-uuid", description: "Category ID" })
	categoryId!: string;

	@ApiProperty({ example: 5000, description: "Budget amount" })
	amount!: number;

	@ApiProperty({ enum: BudgetPeriod, example: "MONTHLY", description: "Budget period" })
	period!: BudgetPeriod;

	@ApiProperty({ example: "2026-01-15T00:00:00.000Z", description: "Start date of first cycle" })
	startDate!: Date;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z", description: "Optional end date" })
	endDate!: Date | null;

	@ApiProperty({ example: true, description: "Whether the budget is active" })
	isActive!: boolean;

	@ApiProperty({ example: "2026-07-28T20:00:00.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-28T20:00:00.000Z", description: "Last update date" })
	updatedAt!: Date;
}

export class BudgetProgressDto {
	@ApiProperty({ example: 3200, description: "Amount spent in the current cycle" })
	spent!: number;

	@ApiProperty({ example: 5000, description: "Budget amount" })
	budget!: number;

	@ApiProperty({ example: 1800, description: "Remaining budget (budget - spent)" })
	remaining!: number;

	@ApiProperty({ example: 64, description: "Percentage of budget used (0-100+)" })
	percentage!: number;

	@ApiProperty({ example: "2026-07-15T00:00:00.000Z", description: "Current cycle start date" })
	periodStart!: Date;

	@ApiProperty({ example: "2026-08-14T23:59:59.999Z", description: "Current cycle end date" })
	periodEnd!: Date;
}