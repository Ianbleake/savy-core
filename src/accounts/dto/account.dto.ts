import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsBooleanString,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

enum AccountType {
	DEBIT = "DEBIT",
	CREDIT = "CREDIT",
	LOAN = "LOAN",
	CASH = "CASH",
}

enum AccountSortBy {
	balance = "balance",
	name = "name",
	createdAt = "createdAt",
}

enum SortOrder {
	asc = "asc",
	desc = "desc",
}

export class CreateAccountDto {
	@ApiProperty({ example: "Checking Account", description: "Account display name" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ enum: AccountType, example: "DEBIT", description: "Account type" })
	@IsEnum(AccountType)
	type!: AccountType;

	@ApiPropertyOptional({
		example: "bank-uuid",
		description: "Bank ID (null for CASH accounts)",
	})
	@IsOptional()
	@IsString()
	bankId?: string | null;

	@ApiPropertyOptional({ example: "MXN", description: "ISO currency code" })
	@IsOptional()
	@IsString()
	currency?: string;

	@ApiPropertyOptional({ example: 5000.0, description: "Initial balance" })
	@IsOptional()
	@IsNumber()
	balance?: number;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color hex/oklch" })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "wallet", description: "Icon identifier" })
	@IsOptional()
	@IsString()
	icon?: string;
}

export class UpdateAccountDto {
	@ApiPropertyOptional({ example: "Checking Account", description: "Account display name" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@ApiPropertyOptional({ example: "bank-uuid", description: "Bank ID (null for CASH accounts)" })
	@IsOptional()
	@IsString()
	bankId?: string | null;

	@ApiPropertyOptional({ example: "MXN", description: "ISO currency code" })
	@IsOptional()
	@IsString()
	currency?: string;

	@ApiPropertyOptional({ example: 5000.0, description: "Current balance" })
	@IsOptional()
	@IsNumber()
	balance?: number;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color hex/oklch" })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "wallet", description: "Icon identifier" })
	@IsOptional()
	@IsString()
	icon?: string;
}

export class AccountResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Account ID" })
	id!: string;

	@ApiProperty({ example: "profile-uuid", description: "Owner profile ID" })
	profileId!: string;

	@ApiPropertyOptional({ example: "bank-uuid", description: "Bank ID (null for CASH)" })
	bankId!: string | null;

	@ApiProperty({ example: "Checking Account", description: "Account display name" })
	name!: string;

	@ApiProperty({ enum: AccountType, example: "DEBIT", description: "Account type" })
	type!: AccountType;

	@ApiProperty({ example: "MXN", description: "ISO currency code" })
	currency!: string;

	@ApiProperty({ example: 5000.0, description: "Current balance" })
	balance!: number;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color" })
	color!: string | null;

	@ApiPropertyOptional({ example: "wallet", description: "Icon identifier" })
	icon!: string | null;

	@ApiProperty({ example: true, description: "Whether the account is active" })
	isActive!: boolean;

	@ApiProperty({ example: "2026-07-28T07:06:12.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-28T07:06:12.000Z", description: "Last update date" })
	updatedAt!: Date;
}

export class QueryAccountsDto {
	@ApiPropertyOptional({
		enum: AccountType,
		example: "DEBIT",
		description: "Filter by account type",
	})
	@IsOptional()
	@IsEnum(AccountType)
	type?: AccountType;

	@ApiPropertyOptional({ example: "bank-uuid", description: "Filter by bank" })
	@IsOptional()
	@IsString()
	bankId?: string;

	@ApiPropertyOptional({
		example: "true",
		description: 'Filter by active state (accepts "true"/"false")',
	})
	@IsOptional()
	@IsBooleanString()
	isActive?: string;

	@ApiPropertyOptional({
		enum: AccountSortBy,
		example: "createdAt",
		default: "createdAt",
		description: "Sort field",
	})
	@IsOptional()
	@IsEnum(AccountSortBy)
	sortBy?: AccountSortBy;

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
