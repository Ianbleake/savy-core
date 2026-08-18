import { applyDecorators, type Type } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";

/**
 * Success response envelope: { success: true, data: T, message?: string }
 * Uses $ref so Swagger shows the actual DTO shape instead of an empty object.
 */
export function ApiSuccessResponse<T>(status: number, type: Type<T>, description?: string) {
	return applyDecorators(
		ApiExtraModels(type),
		ApiResponse({
			status,
			description: description ?? "",
			schema: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					data: { $ref: getSchemaPath(type) },
					message: { type: "string", nullable: true },
				},
			},
		}),
	);
}

/**
 * Success response envelope for arrays: { success: true, data: T[], message?: string }
 */
export function ApiArraySuccessResponse<T>(status: number, type: Type<T>, description?: string) {
	return applyDecorators(
		ApiExtraModels(type),
		ApiResponse({
			status,
			description: description ?? "",
			schema: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					data: {
						type: "array",
						items: { $ref: getSchemaPath(type) },
					},
					message: { type: "string", nullable: true },
				},
			},
		}),
	);
}

/**
 * Message-only success response: { success: true, data: null, message: string }
 * Used for delete, logout, deactivate endpoints.
 */
export function ApiMessageResponse(status: number, description?: string) {
	return ApiResponse({
		status,
		description: description ?? "",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean", example: true },
				data: { type: "string", nullable: true, example: null },
				message: { type: "string" },
			},
		},
	});
}

/**
 * Error response envelope: { success: false, data: null, message: string }
 */
export function ApiErrorResponse(status: number, description?: string) {
	return ApiResponse({
		status,
		description: description ?? "",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean", example: false },
				data: { type: "string", nullable: true, example: null },
				message: { type: "string" },
			},
		},
	});
}
