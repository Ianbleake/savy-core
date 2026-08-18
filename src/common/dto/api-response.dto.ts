import { ApiProperty } from "@nestjs/swagger";

/**
 * Success envelope — wraps all successful API responses.
 * Matches ResponseInterceptor output.
 */
export class ApiSuccessResponseDto<T> {
	@ApiProperty({ example: true, description: "Whether the request succeeded" })
	success!: boolean;

	@ApiProperty({ description: "The response payload" })
	data!: T;

	@ApiProperty({ required: false, description: "Optional message (e.g. 'Account deactivated')" })
	message?: string;
}

/**
 * Message-only success response (e.g. delete, logout, deactivate).
 * Matches ResponseInterceptor output when controller returns { message: "..." }.
 */
export class ApiMessageResponseDto {
	@ApiProperty({ example: true, description: "Whether the request succeeded" })
	success!: boolean;

	@ApiProperty({
		example: null,
		nullable: true,
		type: String,
		description: "Always null for message-only responses",
	})
	data!: null;

	@ApiProperty({ example: "Account deactivated", description: "The action result message" })
	message!: string;
}

/**
 * Error envelope — wraps all error responses.
 * Matches HttpExceptionFilter output.
 */
export class ApiErrorResponseDto {
	@ApiProperty({ example: false, description: "Whether the request succeeded" })
	success!: boolean;

	@ApiProperty({
		example: null,
		nullable: true,
		type: String,
		description: "Always null on error",
	})
	data!: null;

	@ApiProperty({
		example: "Not found",
		description: "Error message. For validation errors, this is the joined validation messages.",
	})
	message!: string;
}
