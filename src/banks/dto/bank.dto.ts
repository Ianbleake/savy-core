import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBankDto {
	@ApiProperty({ example: "BBVA", description: "Bank display name" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color hex/oklch", required: false })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "bbva-logo", description: "Logo identifier or URL", required: false })
	@IsOptional()
	@IsString()
	logo?: string;
}

export class UpdateBankDto {
	@ApiPropertyOptional({ example: "BBVA", description: "Bank display name", required: false })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color hex/oklch", required: false })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "bbva-logo", description: "Logo identifier or URL", required: false })
	@IsOptional()
	@IsString()
	logo?: string;
}

export class BankResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Bank ID" })
	id!: string;

	@ApiProperty({ example: "profile-uuid", description: "Owner profile ID" })
	profileId!: string;

	@ApiProperty({ example: "BBVA", description: "Bank display name" })
	name!: string;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color" })
	color!: string | null;

	@ApiPropertyOptional({ example: "bbva-logo", description: "Logo identifier or URL" })
	logo!: string | null;

	@ApiProperty({ example: true, description: "Whether the bank is active" })
	isActive!: boolean;

	@ApiProperty({ example: "2026-07-28T07:06:12.000Z", description: "Creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-28T07:06:12.000Z", description: "Last update date" })
	updatedAt!: Date;
}