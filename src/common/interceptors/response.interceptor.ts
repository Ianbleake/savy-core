import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

/**
 * Global response interceptor — wraps ALL successful responses in a standard envelope.
 *
 * Before: controller returns `{ id, name, balance }` or `[{ id, ... }, ...]`
 * After:  client receives `{ success: true, data: { id, name, balance }, message: undefined }`
 *
 * If the controller already returns `{ message: "..." }` (e.g. logout, delete),
 * the message is extracted and the remaining data is placed in `data`.
 *
 * Exception responses are handled by HttpExceptionFilter, not this interceptor.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
		return next.handle().pipe(
			map((responseData) => {
				// If the controller returned an object with only a `message` field,
				// treat it as a message-only response (e.g. { message: "Logged out" })
				if (
					responseData &&
					typeof responseData === "object" &&
					"message" in responseData &&
					Object.keys(responseData).length === 1
				) {
					return {
						success: true,
						data: null as T,
						message: responseData.message,
					};
				}

				return {
					success: true,
					data: responseData,
				};
			}),
		);
	}
}
