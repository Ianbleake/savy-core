import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

enum AccountType {
	BANK = "BANK",
	CREDIT = "CREDIT",
	LOAN = "LOAN",
}

export class CreateAccountDto {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsEnum(AccountType)
	type!: AccountType;

	@IsString()
	@IsOptional()
	currency?: string;

	@IsNumber()
	@IsOptional()
	balance?: number;

	@IsString()
	@IsOptional()
	color?: string;

	@IsString()
	@IsOptional()
	icon?: string;
}

export class UpdateAccountDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	currency?: string;

	@IsNumber()
	@IsOptional()
	balance?: number;

	@IsString()
	@IsOptional()
	color?: string;

	@IsString()
	@IsOptional()
	icon?: string;
}
