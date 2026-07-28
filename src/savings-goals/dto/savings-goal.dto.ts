import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from "class-validator";

export class CreateSavingsGoalDto {
	@ApiProperty({ example: "account-uuid", description: "Account ID where the savings money lives (DEBIT or CASH)" })
	@IsString()
	@IsNotEmpty()
	accountId!: string;

	@ApiProperty({ example: "Viaje a Europa", description: "Savings goal display name" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@ApiProperty({ example: 50000, description: "Target amount to save" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	targetAmount!: number;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z", description: "Optional deadline" })
	@IsOptional()
	@IsDateString()
	deadline?: string;

	@ApiPropertyOptional({ example: "#22c55e", description: "UI color hex/oklch" })
	@IsOptional()
	@IsString()
	color?: string;
}

export class UpdateSavingsGoalDto {
	@ApiPropertyOptional({ example: "account-uuid", description: "Account ID where the savings money lives" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	accountId?: string;

	@ApiPropertyOptional({ example: "Viaje a Europa", description: "Savings goal display name" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({ example: 50000, description: "Target amount to save" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	targetAmount?: number;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z", description: "Optional deadline" })
	@IsOptional()
	@IsDateString()
	deadline?: string;

	@ApiPropertyOptional({ example: "#22c55e", description: "UI color hex/oklch" })
	@IsOptional()
	@IsString()
	color?: string;
}

export class SavingsGoalResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Savings goal ID" })
	id!: string;

	@ApiProperty({ example: "profile-uuid", description: "Owner profile ID" })
	profileId!: string;

	@ApiProperty({ example: "account-uuid", description: "Account ID where the savings money lives" })
	accountId!: string;

	@ApiProperty({ example: "Viaje a Europa", description: "Savings goal display name" })
	name!: string;

	@ApiProperty({ example: 50000, description: "Target amount to save" })
	targetAmount!: number;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z", description: "Optional deadline" })
	deadline!: Date | null;

	@ApiPropertyOptional({ example: "#22c55e", description: "UI color" })
	color!: string | null;

	@ApiProperty({ example: 12500, description: "Current amount saved (computed from account balance)" })
	currentAmount!: number;

	@ApiProperty({ example: false, description: "Whether the goal is completed (computed: currentAmount >= targetAmount)" })
	isCompleted!: boolean;

	@ApiProperty({ example: "2026-07-28T20:31:08.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-28T20:31:08.000Z", description: "Last update date" })
	updatedAt!: Date;
}