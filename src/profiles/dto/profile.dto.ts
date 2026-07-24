import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

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
