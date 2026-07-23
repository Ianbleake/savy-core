import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";
import type { Account } from "../generated/prisma/client";

@Injectable()
export class AccountsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByUser(userId: string): Promise<Account[]> {
		return this.prisma.account.findMany({
			where: { userId, isActive: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string, userId: string): Promise<Account> {
		const account = await this.prisma.account.findFirst({
			where: { id, userId },
		});
		if (!account) {
			throw new NotFoundException("Account not found");
		}
		return account;
	}

	async create(userId: string, dto: CreateAccountDto): Promise<Account> {
		return this.prisma.account.create({
			data: {
				userId,
				name: dto.name,
				type: dto.type,
				currency: dto.currency ?? "MXN",
				balance: dto.balance ?? 0,
				color: dto.color,
				icon: dto.icon,
			},
		});
	}

	async update(id: string, userId: string, dto: UpdateAccountDto): Promise<Account> {
		await this.findOne(id, userId);
		return this.prisma.account.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: string, userId: string): Promise<void> {
		await this.findOne(id, userId);
		await this.prisma.account.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
