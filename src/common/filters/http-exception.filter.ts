import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

/**
 * Global exception filter — wraps ALL errors in the standard envelope.
 *
 * NestJS default:  `{ statusCode: 404, message: "Not found", error: "Not Found" }`
 * After this filter: `{ success: false, data: null, message: "Not found" }`
 *
 * For validation errors (ValidationPipe), `message` is an array of strings.
 * This filter joins them into a single comma-separated string.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		let message = "Internal server error";

		if (exception instanceof HttpException) {
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === "string") {
				message = exceptionResponse;
			} else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
				const responseObj = exceptionResponse as Record<string, unknown>;

				// ValidationPipe returns { message: string[] } — join into single string
				if (Array.isArray(responseObj.message)) {
					message = responseObj.message.join(", ");
				} else if (typeof responseObj.message === "string") {
					message = responseObj.message;
				}
			}
		} else if (exception instanceof Error) {
			message = exception.message;
		}

		response.status(status).json({
			success: false,
			data: null,
			message,
		});
	}
}