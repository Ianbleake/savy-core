import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

/**
 * Asserts that the given enum field on the DTO rejects an invalid value
 * with at least one validation error. Used to prove invalid query values
 * produce a 400 via the global ValidationPipe.
 */
export async function expectEnumRejection(
	DtoCtor: new () => Record<string, unknown>,
	field: string,
	invalidValue: unknown,
): Promise<void> {
	const instance = plainToInstance(DtoCtor, { [field]: invalidValue });
	const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
	const fieldErrors = errors.filter((e) => e.property === field);
	expect(fieldErrors.length).toBeGreaterThan(0);
}
