import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

enum CategoryType {
	INCOME = "INCOME",
	EXPENSE = "EXPENSE",
}

export class CreateCategoryDto {
	@ApiProperty({ example: "Salario", description: "Category display name" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name!: string;

	@ApiProperty({
		enum: CategoryType,
		example: "INCOME",
		description: "Category type (immutable after creation)",
	})
	@IsEnum(CategoryType)
	type!: CategoryType;

	@ApiPropertyOptional({ example: "#22c55e", description: "UI color hex/oklch" })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "briefcase", description: "Icon identifier" })
	@IsOptional()
	@IsString()
	icon?: string;
}

export class UpdateCategoryDto {
	@ApiPropertyOptional({ example: "Salario", description: "Category display name" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name?: string;

	@ApiPropertyOptional({ example: "#22c55e", description: "UI color hex/oklch" })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "briefcase", description: "Icon identifier" })
	@IsOptional()
	@IsString()
	icon?: string;
}

export class CategoryResponseDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Category ID" })
	id!: string;

	@ApiProperty({ example: "profile-uuid", description: "Owner profile ID" })
	profileId!: string;

	@ApiProperty({ example: "Salario", description: "Category display name" })
	name!: string;

	@ApiProperty({ enum: CategoryType, example: "INCOME", description: "Category type" })
	type!: CategoryType;

	@ApiPropertyOptional({ example: "#22c55e", description: "UI color" })
	color!: string | null;

	@ApiPropertyOptional({ example: "briefcase", description: "Icon identifier" })
	icon!: string | null;

	@ApiProperty({ example: "2026-07-28T07:06:12.000Z", description: "Creation date" })
	createdAt!: Date;
}