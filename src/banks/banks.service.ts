import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBankDto, UpdateBankDto } from "./dto/bank.dto";

@Injectable()
export class BanksService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters?: {
			isActive?: boolean;
			sortBy?: "name" | "createdAt";
			order?: "asc" | "desc";
		},
	) {
		const sortBy = filters?.sortBy ?? "name";
		const order = filters?.order ?? "asc";
		const isActive = filters?.isActive === undefined ? true : filters.isActive;
		return this.prisma.bank.findMany({
			where: { profileId, isActive },
			orderBy: { [sortBy]: order },
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
