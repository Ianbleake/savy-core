import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from "class-validator";

enum IncomeFrequency {
	WEEKLY = "WEEKLY",
	BIWEEKLY = "BIWEEKLY",
	MONTHLY = "MONTHLY",
}

export class CreateIncomeSourceDto {
	@ApiProperty({ example: "Trabajo principal", description: "Income source display name" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@ApiProperty({ example: 25000, description: "Amount received per payment cycle" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount!: number;

	@ApiProperty({
		enum: IncomeFrequency,
		example: "MONTHLY",
		description: "Payment frequency",
	})
	@IsEnum(IncomeFrequency)
	frequency!: IncomeFrequency;

	@ApiProperty({
		example: 15,
		description: "Day of payment (1-31 for MONTHLY/BIWEEKLY, 1-7 for WEEKLY)",
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(31)
	payday!: number;
}

export class UpdateIncomeSourceDto {
	@ApiPropertyOptional({ example: "Trabajo principal", description: "Income source display name" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({ example: 25000, description: "Amount received per payment cycle" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	amount?: number;

	@ApiPropertyOptional({
		enum: IncomeFrequency,
		example: "MONTHLY",
		description: "Payment frequency",
	})
	@IsOptional()
	@IsEnum(IncomeFrequency)
	frequency?: IncomeFrequency;

	@ApiPropertyOptional({
		example: 15,
		description: "Day of payment (1-31 for MONTHLY/BIWEEKLY, 1-7 for WEEKLY)",
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(31)
	payday?: number;
}

export class IncomeSourceResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Income source ID" })
	id!: string;

	@ApiProperty({ example: "profile-uuid", description: "Owner profile ID" })
	profileId!: string;

	@ApiProperty({ example: "Trabajo principal", description: "Income source display name" })
	name!: string;

	@ApiProperty({ example: 25000, description: "Amount received per payment cycle" })
	amount!: number;

	@ApiProperty({ enum: IncomeFrequency, example: "MONTHLY", description: "Payment frequency" })
	frequency!: IncomeFrequency;

	@ApiProperty({
		example: 15,
		description: "Day of payment (1-31 for MONTHLY/BIWEEKLY, 1-7 for WEEKLY)",
	})
	payday!: number;

	@ApiProperty({ example: true, description: "Whether the income source is active" })
	isActive!: boolean;

	@ApiProperty({ example: "2026-07-27T05:14:40.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-27T05:14:40.000Z", description: "Last update date" })
	updatedAt!: Date;
}