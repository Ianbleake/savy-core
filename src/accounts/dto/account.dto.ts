import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

enum AccountType {
	BANK = "BANK",
	CREDIT = "CREDIT",
	LOAN = "LOAN",
}

export class CreateAccountDto {
	@ApiProperty({ example: "Checking Account", description: "Account display name" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ enum: AccountType, example: "BANK", description: "Account type" })
	@IsEnum(AccountType)
	type!: AccountType;

	@ApiProperty({ example: "MXN", description: "ISO currency code", required: false })
	@IsString()
	@IsOptional()
	currency?: string;

	@ApiProperty({ example: 5000.0, description: "Initial balance", required: false })
	@IsNumber()
	@IsOptional()
	balance?: number;

	@ApiProperty({ example: "#0d9488", description: "UI color hex/oklch", required: false })
	@IsString()
	@IsOptional()
	color?: string;

	@ApiProperty({ example: "wallet", description: "Icon identifier", required: false })
	@IsString()
	@IsOptional()
	icon?: string;
}

export class UpdateAccountDto {
	@ApiProperty({ example: "Checking Account", description: "Account display name", required: false })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiProperty({ example: "MXN", description: "ISO currency code", required: false })
	@IsString()
	@IsOptional()
	currency?: string;

	@ApiProperty({ example: 5000.0, description: "Current balance", required: false })
	@IsNumber()
	@IsOptional()
	balance?: number;

	@ApiProperty({ example: "#0d9488", description: "UI color hex/oklch", required: false })
	@IsString()
	@IsOptional()
	color?: string;

	@ApiProperty({ example: "wallet", description: "Icon identifier", required: false })
	@IsString()
	@IsOptional()
	icon?: string;
}