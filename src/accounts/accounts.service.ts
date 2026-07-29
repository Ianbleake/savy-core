import { Injectable, NotFoundException } from "@nestjs/common";
import type { Account, AccountType } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";

@Injectable()
export class AccountsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters?: {
			type?: AccountType;
			bankId?: string;
			isActive?: boolean;
			sortBy?: "balance" | "name" | "createdAt";
			order?: "asc" | "desc";
		},
	): Promise<Account[]> {
		const sortBy = filters?.sortBy ?? "createdAt";
		const order = filters?.order ?? "desc";
		// Default to active accounts unless the caller explicitly requests inactive
		const isActive = filters?.isActive === undefined ? true : filters.isActive;

		return this.prisma.account.findMany({
			where: {
				profileId,
				isActive,
				...(filters?.type ? { type: filters.type } : {}),
				...(filters?.bankId ? { bankId: filters.bankId } : {}),
			},
			orderBy: { [sortBy]: order },
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
		if (dto.bankId) {
			await this.validateBankOwnership(dto.bankId, profileId);
		}

		return this.prisma.account.create({
			data: {
				profileId,
				bankId: dto.bankId ?? null,
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

		if (dto.bankId) {
			await this.validateBankOwnership(dto.bankId, profileId);
		}

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

	private async validateBankOwnership(bankId: string, profileId: string): Promise<void> {
		const bank = await this.prisma.bank.findFirst({
			where: { id: bankId, profileId },
			select: { id: true },
		});
		if (!bank) {
			throw new NotFoundException("Bank not found");
		}
	}
}
