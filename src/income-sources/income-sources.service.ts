import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { IncomeSource } from "../generated/prisma/client";
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
		return this.prisma.incomeSource.create({
			data: {
				profileId,
				name: dto.name,
				amount: dto.amount,
				frequency: dto.frequency,
				payday: dto.payday,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateIncomeSourceDto): Promise<IncomeSource> {
		await this.findOne(id, profileId);
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
			const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });

			if (errors.length > 0) {
				failed.push({
					input: raw as unknown as Record<string, unknown>,
					errors: errors.flatMap((e) => Object.values(e.constraints ?? {})),
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
						payday: instance.payday,
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
}