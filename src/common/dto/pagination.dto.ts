import { ApiProperty } from "@nestjs/swagger";
import type { ClassConstructor } from "class-transformer";

/**
 * Generic paginated response envelope used by Swagger for paginated endpoints.
 * The actual controller still returns the raw shape; this DTO only documents it.
 */
export class PaginationMetaDto {
	@ApiProperty({ example: 1, description: "Current page number" })
	page!: number;

	@ApiProperty({ example: 50, description: "Items per page" })
	limit!: number;

	@ApiProperty({ example: 137, description: "Total matching items" })
	total!: number;

	@ApiProperty({ example: 3, description: "Total pages (ceil(total/limit))" })
	totalPages!: number;
}

export class PaginatedResponseDto<T> {
	@ApiProperty({ isArray: true, description: "Items for the current page" })
	data!: T[];

	@ApiProperty({ type: PaginationMetaDto, description: "Pagination metadata" })
	meta!: PaginationMetaDto;
}

export type PaginatedResponse<T> = {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export type PaginatedModel<T> = ClassConstructor<T>;
