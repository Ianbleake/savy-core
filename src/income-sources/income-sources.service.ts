import { Injectable, NotFoundException } from "@nestjs/common";
import type { IncomeSource } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateIncomeSourceDto, UpdateIncomeSourceDto } from "./dto/income-source.dto";

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
}