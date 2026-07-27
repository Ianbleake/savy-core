import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { IncomeFrequency, IncomeSource } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
	BulkCreateIncomeSourcesDto,
	CreateIncomeSourceDto,
	FailedIncomeSourceDto,
	UpdateIncomeSourceDto,
} from "./dto/income-source.dto";

export interface BulkCreateResult {
	creationState: "success" | "partial" | "failed";
	total: number;
	successful: IncomeSource[];
	failed: FailedIncomeSourceDto[];
}

const PAYDAY_RULES: Record<IncomeFrequency, { count: number; max: number; label: string }> = {
	WEEKLY: { count: 1, max: 7, label: "weekday (1-7)" },
	BIWEEKLY: { count: 2, max: 31, label: "days of month (1-31)" },
	MONTHLY: { count: 1, max: 31, label: "day of month (1-31)" },
};

@Injectable()
export class IncomeSourcesService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(profileId: string): Promise<IncomeSource[]> {
		return this.prisma.incomeSource.findMany({
			where: { profileId, isActive: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string, profileId: string): Promise<IncomeSource> {
		const source = await this.prisma.incomeSource.findFirst({
			where: { id, profileId },
		});
		if (!source) {
			throw new NotFoundException("Income source not found");
		}
		return source;
	}

	async create(profileId: string, dto: CreateIncomeSourceDto): Promise<IncomeSource> {
		const paydayErrors = this.validatePaydays(dto.frequency, dto.paydays);
		if (paydayErrors.length > 0) {
			throw new BadRequestException(paydayErrors);
		}

		return this.prisma.incomeSource.create({
			data: {
				profileId,
				name: dto.name,
				amount: dto.amount,
				frequency: dto.frequency,
				paydays: dto.paydays,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateIncomeSourceDto): Promise<IncomeSource> {
		const existing = await this.findOne(id, profileId);

		const frequency = dto.frequency ?? existing.frequency;
		const paydays = dto.paydays ?? existing.paydays;

		const paydayErrors = this.validatePaydays(frequency, paydays);
		if (paydayErrors.length > 0) {
			throw new BadRequestException(paydayErrors);
		}

		return this.prisma.incomeSource.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOne(id, profileId);
		await this.prisma.incomeSource.update({
			where: { id },
			data: { isActive: false },
		});
	}

	async bulkCreate(profileId: string, dto: BulkCreateIncomeSourcesDto): Promise<BulkCreateResult> {
		const successful: IncomeSource[] = [];
		const failed: FailedIncomeSourceDto[] = [];

		for (const raw of dto.sources) {
			const instance = plainToInstance(CreateIncomeSourceDto, raw);
			const decoratorErrors = await validate(instance, {
				whitelist: true,
				forbidNonWhitelisted: true,
			});

			const decoratorMessages = decoratorErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);

			const paydayErrors =
				instance.frequency && instance.paydays
					? this.validatePaydays(instance.frequency, instance.paydays)
					: [];

			const allErrors = [...decoratorMessages, ...paydayErrors];

			if (allErrors.length > 0) {
				failed.push({
					input: raw as unknown as Record<string, unknown>,
					errors: allErrors,
				});
				continue;
			}

			try {
				const created = await this.prisma.incomeSource.create({
					data: {
						profileId,
						name: instance.name,
						amount: instance.amount,
						frequency: instance.frequency,
						paydays: instance.paydays,
					},
				});
				successful.push(created);
			} catch (error) {
				failed.push({
					input: raw as unknown as Record<string, unknown>,
					errors: [(error as Error).message],
				});
			}
		}

		const total = dto.sources.length;
		const creationState: BulkCreateResult["creationState"] =
			successful.length === total
				? "success"
				: successful.length === 0
					? "failed"
					: "partial";

		return { creationState, total, successful, failed };
	}

	private validatePaydays(frequency: IncomeFrequency, paydays: number[]): string[] {
		const errors: string[] = [];
		const rule = PAYDAY_RULES[frequency];

		if (paydays.length !== rule.count) {
			errors.push(
				`paydays must contain exactly ${rule.count} value(s) for ${frequency} frequency, got ${paydays.length}`,
			);
		}

		for (const d of paydays) {
			if (d < 1 || d > rule.max) {
				errors.push(`payday ${d} is out of range (1-${rule.max}) for ${frequency} frequency`);
			}
		}

		return errors;
	}
}