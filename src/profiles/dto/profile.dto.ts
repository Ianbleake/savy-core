import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

// ─── Response DTO ────────────────────────────────────────────────────

export class ProfileResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Profile ID" })
	id!: string;

	@ApiProperty({ example: "sub_abc123", description: "Supabase auth user ID" })
	authId!: string;

	@ApiProperty({ example: "user@example.com", description: "User email" })
	email!: string;

	@ApiPropertyOptional({ example: "John", description: "First name" })
	firstName!: string | null;

	@ApiPropertyOptional({ example: "Doe", description: "Last name" })
	lastName!: string | null;

	@ApiPropertyOptional({ example: "Smith", description: "Second last name (maternal)" })
	secondLastName!: string | null;

	@ApiPropertyOptional({ example: "John Doe Smith", description: "Computed full name" })
	fullName!: string | null;

	@ApiPropertyOptional({ example: "JD", description: "Computed initials from first and last name" })
	initials!: string | null;

	@ApiPropertyOptional({ example: "https://example.com/avatar.jpg", description: "Avatar URL" })
	avatarUrl!: string | null;

	@ApiPropertyOptional({ example: "+52 55 1234 5678", description: "Phone number" })
	phone!: string | null;

	@ApiProperty({ example: "MXN", description: "Preferred currency code" })
	currency!: string;

	@ApiProperty({ example: "es-MX", description: "Preferred locale" })
	locale!: string;

	@ApiProperty({ example: "America/Mexico_City", description: "Preferred timezone" })
	timezone!: string;

	@ApiProperty({ example: "2026-01-15T10:30:00.000Z", description: "Profile creation date" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-24T18:00:00.000Z", description: "Last update date" })
	updatedAt!: Date;
}

// ─── Request DTO ─────────────────────────────────────────────────────

export class UpdateProfileDto {
	@ApiPropertyOptional({ example: "John", description: "First name" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	firstName?: string;

	@ApiPropertyOptional({ example: "Doe", description: "Last name" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	lastName?: string;

	@ApiPropertyOptional({ example: "Smith", description: "Second last name (maternal)" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	secondLastName?: string;

	@ApiPropertyOptional({ example: "https://example.com/avatar.jpg", description: "Avatar URL" })
	@IsOptional()
	@IsString()
	avatarUrl?: string | null;

	@ApiPropertyOptional({ example: "+52 55 1234 5678", description: "Phone number" })
	@IsOptional()
	@IsString()
	phone?: string | null;

	@ApiPropertyOptional({ example: "MXN", description: "Preferred currency code" })
	@IsOptional()
	@IsString()
	@MaxLength(3)
	currency?: string;

	@ApiPropertyOptional({ example: "es-MX", description: "Preferred locale" })
	@IsOptional()
	@IsString()
	@MaxLength(10)
	locale?: string;

	@ApiPropertyOptional({ example: "America/Mexico_City", description: "Preferred timezone" })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	timezone?: string;
}
