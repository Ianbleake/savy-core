import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBankDto, UpdateBankDto } from "./dto/bank.dto";

@Injectable()
export class BanksService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(profileId: string) {
		return this.prisma.bank.findMany({
			where: { profileId, isActive: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string, profileId: string) {
		const bank = await this.prisma.bank.findFirst({
			where: { id, profileId },
			include: {
				accounts: {
					where: { isActive: true },
					include: {
						creditCard: true,
						loan: true,
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});
		if (!bank) {
			throw new NotFoundException("Bank not found");
		}
		return bank;
	}

	async create(profileId: string, dto: CreateBankDto) {
		return this.prisma.bank.create({
			data: {
				profileId,
				name: dto.name,
				color: dto.color,
				logo: dto.logo,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateBankDto) {
		await this.findOneBasic(id, profileId);
		return this.prisma.bank.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOneBasic(id, profileId);
		await this.prisma.bank.update({
			where: { id },
			data: { isActive: false },
		});
	}

	private async findOneBasic(id: string, profileId: string) {
		const bank = await this.prisma.bank.findFirst({
			where: { id, profileId },
		});
		if (!bank) {
			throw new NotFoundException("Bank not found");
		}
		return bank;
	}
}