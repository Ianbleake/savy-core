import { Injectable, NotFoundException } from "@nestjs/common";
import type { Account } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";

@Injectable()
export class AccountsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(profileId: string): Promise<Account[]> {
		return this.prisma.account.findMany({
			where: { profileId, isActive: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string, profileId: string): Promise<Account> {
		const account = await this.prisma.account.findFirst({
			where: { id, profileId },
		});
		if (!account) {
			throw new NotFoundException("Account not found");
		}
		return account;
	}

	async create(profileId: string, dto: CreateAccountDto): Promise<Account> {
		return this.prisma.account.create({
			data: {
				profileId,
				name: dto.name,
				type: dto.type,
				currency: dto.currency ?? "MXN",
				balance: dto.balance ?? 0,
				color: dto.color,
				icon: dto.icon,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateAccountDto): Promise<Account> {
		await this.findOne(id, profileId);
		return this.prisma.account.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOne(id, profileId);
		await this.prisma.account.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
