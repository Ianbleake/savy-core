import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsBoolean,
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class CreateCardStatementDto {
	@ApiProperty({ example: "credit-card-uuid", description: "Credit card ID" })
	@IsString()
	@IsNotEmpty()
	creditCardId!: string;

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z", description: "Statement period start" })
	@IsDateString()
	periodStart!: string;

	@ApiProperty({ example: "2026-07-31T23:59:59.999Z", description: "Statement period end" })
	@IsDateString()
	periodEnd!: string;

	@ApiProperty({ example: 15000, description: "Statement balance" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	balance!: number;

	@ApiProperty({ example: 750, description: "Minimum payment" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minPayment!: number;

	@ApiProperty({ example: 15000, description: "No-interest payment (full balance to avoid interest)" })
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	noInterestPayment!: number;

	@ApiPropertyOptional({ example: 2250, description: "Interest amount", required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	interestAmount?: number;
}

export class UpdateCardStatementDto {
	@ApiPropertyOptional({ example: 15000, description: "Statement balance" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	balance?: number;

	@ApiPropertyOptional({ example: 750, description: "Minimum payment" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minPayment?: number;

	@ApiPropertyOptional({ example: 15000, description: "No-interest payment" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	noInterestPayment?: number;

	@ApiPropertyOptional({ example: 2250, description: "Interest amount" })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	interestAmount?: number;

	@ApiPropertyOptional({ example: true, description: "Whether the statement is paid" })
	@IsOptional()
	@IsBoolean()
	isPaid?: boolean;
}

export class CardStatementResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Statement ID" })
	id!: string;

	@ApiProperty({ example: "credit-card-uuid", description: "Credit card ID" })
	creditCardId!: string;

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z", description: "Period start" })
	periodStart!: Date;

	@ApiProperty({ example: "2026-07-31T23:59:59.999Z", description: "Period end" })
	periodEnd!: Date;

	@ApiProperty({ example: 15000, description: "Statement balance" })
	balance!: number;

	@ApiProperty({ example: 750, description: "Minimum payment" })
	minPayment!: number;

	@ApiProperty({ example: 15000, description: "No-interest payment" })
	noInterestPayment!: number;

	@ApiProperty({ example: 2250, description: "Interest amount" })
	interestAmount!: number;

	@ApiProperty({ example: false, description: "Whether the statement is paid" })
	isPaid!: boolean;

	@ApiProperty({ example: "2026-07-28T20:00:00.000Z", description: "Creation date" })
	createdAt!: Date;
}