import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Account, Prisma, Transaction, TransactionType } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto, UpdateTransactionDto } from "./dto/transaction.dto";

@Injectable()
export class TransactionsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters: {
			accountId?: string;
			type?: TransactionType;
			categoryId?: string;
			bankId?: string;
			search?: string;
			from?: Date;
			to?: Date;
			page?: number;
			limit?: number;
			sortBy?: "date" | "amount" | "createdAt";
			order?: "asc" | "desc";
		},
	): Promise<{
		data: Transaction[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		const page = filters.page ?? 1;
		const limit = Math.min(filters.limit ?? 50, 100);
		const skip = (page - 1) * limit;
		const sortBy = filters.sortBy ?? "date";
		const order = filters.order ?? "desc";

		// Find all accounts owned by the profile (source or destination)
		const ownedAccountIds = await this.prisma.account
			.findMany({
				where: { profileId },
				select: { id: true },
			})
			.then((accounts) => accounts.map((a) => a.id));

		// If a bank filter is provided, intersect owned accounts with those of the bank
		let scopedAccountIds = ownedAccountIds;
		if (filters.bankId) {
			const bankAccountIds = await this.prisma.account
				.findMany({
					where: { profileId, bankId: filters.bankId },
					select: { id: true },
				})
				.then((accounts) => accounts.map((a) => a.id));
			scopedAccountIds = ownedAccountIds.filter((id) => bankAccountIds.includes(id));
		}

		const where: Prisma.TransactionWhereInput = {
			AND: [
				{
					OR: [
						{ accountId: { in: scopedAccountIds } },
						{ destinationAccountId: { in: scopedAccountIds } },
					],
				},
				filters.accountId
					? {
							OR: [{ accountId: filters.accountId }, { destinationAccountId: filters.accountId }],
						}
					: {},
				filters.type ? { type: filters.type } : {},
				filters.categoryId ? { categoryId: filters.categoryId } : {},
				filters.search ? { description: { contains: filters.search, mode: "insensitive" } } : {},
				filters.from || filters.to
					? {
							date: {
								...(filters.from ? { gte: filters.from } : {}),
								...(filters.to ? { lte: filters.to } : {}),
							},
						}
					: {},
			],
		};

		const [data, total] = await Promise.all([
			this.prisma.transaction.findMany({
				where,
				skip,
				take: limit,
				orderBy: { [sortBy]: order },
			}),
			this.prisma.transaction.count({ where }),
		]);

		const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

		return { data, total, page, limit, totalPages };
	}

	async findOne(id: string, profileId: string): Promise<Transaction> {
		const transaction = await this.prisma.transaction.findFirst({
			where: {
				id,
				OR: [{ account: { profileId } }, { destinationAccount: { profileId } }],
			},
		});
		if (!transaction) {
			throw new NotFoundException("Transaction not found");
		}
		return transaction;
	}

	async create(profileId: string, dto: CreateTransactionDto): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			await this.validateAccountOwnership(tx, dto.accountId, profileId);
			this.validateTypeRules(dto.type, dto.destinationAccountId);

			let destinationAccount: Account | null = null;
			if (dto.destinationAccountId) {
				destinationAccount = await this.validateAccountOwnership(
					tx,
					dto.destinationAccountId,
					profileId,
				);
				this.validateDestinationType(dto.type, destinationAccount.type);
			}

			await this.validateCategoryOwnership(tx, dto.categoryId, profileId, dto.type);

			const transaction = await tx.transaction.create({
				data: {
					accountId: dto.accountId,
					destinationAccountId: dto.destinationAccountId ?? null,
					categoryId: dto.categoryId ?? null,
					type: dto.type,
					amount: dto.amount,
					description: dto.description,
					note: dto.note,
					date: dto.date ? new Date(dto.date) : new Date(),
				},
			});

			await this.applyBalance(
				tx,
				dto.type,
				dto.accountId,
				dto.destinationAccountId ?? null,
				dto.amount,
				1,
			);

			return transaction;
		});
	}

	async update(id: string, profileId: string, dto: UpdateTransactionDto): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			const existing = await this.findOne(id, profileId);

			// Reverse old balance effect
			await this.applyBalance(
				tx,
				existing.type,
				existing.accountId,
				existing.destinationAccountId,
				Number(existing.amount),
				-1,
			);

			// Build new values
			const accountId = dto.accountId ?? existing.accountId;
			const destinationAccountId =
				dto.destinationAccountId !== undefined
					? dto.destinationAccountId
					: existing.destinationAccountId;
			const type = dto.type ?? existing.type;
			const amount = dto.amount ?? Number(existing.amount);
			const categoryId = dto.categoryId !== undefined ? dto.categoryId : existing.categoryId;

			// Validate new values
			await this.validateAccountOwnership(tx, accountId, profileId);
			this.validateTypeRules(type, destinationAccountId);

			let destinationAccount: Account | null = null;
			if (destinationAccountId) {
				destinationAccount = await this.validateAccountOwnership(
					tx,
					destinationAccountId,
					profileId,
				);
				this.validateDestinationType(type, destinationAccount.type);
			}

			await this.validateCategoryOwnership(tx, categoryId, profileId, type);

			const updated = await tx.transaction.update({
				where: { id },
				data: {
					accountId,
					destinationAccountId,
					categoryId,
					type,
					amount,
					description: dto.description !== undefined ? dto.description : existing.description,
					note: dto.note !== undefined ? dto.note : existing.note,
					date: dto.date ? new Date(dto.date) : existing.date,
				},
			});

			// Apply new balance effect
			await this.applyBalance(tx, type, accountId, destinationAccountId, amount, 1);

			return updated;
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		return this.prisma.$transaction(async (tx) => {
			const transaction = await this.findOne(id, profileId);

			await this.applyBalance(
				tx,
				transaction.type,
				transaction.accountId,
				transaction.destinationAccountId,
				Number(transaction.amount),
				-1,
			);

			await tx.transaction.delete({ where: { id } });
		});
	}

	// ── Balance helpers ────────────────────────────────────────────────

	private async applyBalance(
		tx: Prisma.TransactionClient,
		type: TransactionType,
		accountId: string,
		destinationAccountId: string | null,
		amount: number,
		sign: 1 | -1,
	): Promise<void> {
		const delta = amount * sign;

		if (type === "INCOME") {
			await tx.account.update({
				where: { id: accountId },
				data: { balance: { increment: delta } },
			});
		} else if (type === "EXPENSE") {
			await tx.account.update({
				where: { id: accountId },
				data: { balance: { decrement: delta } },
			});
		} else if (type === "TRANSFER" || type === "PAYMENT") {
			await tx.account.update({
				where: { id: accountId },
				data: { balance: { decrement: delta } },
			});
			if (destinationAccountId) {
				await tx.account.update({
					where: { id: destinationAccountId },
					data: { balance: { increment: delta } },
				});
			}
		}
	}

	private validateTypeRules(type: TransactionType, destinationAccountId?: string | null): void {
		if ((type === "INCOME" || type === "EXPENSE") && destinationAccountId) {
			throw new BadRequestException(`destinationAccountId must be null for ${type} transactions`);
		}
		if ((type === "TRANSFER" || type === "PAYMENT") && !destinationAccountId) {
			throw new BadRequestException(`destinationAccountId is required for ${type} transactions`);
		}
	}

	private validateDestinationType(type: TransactionType, destType: string): void {
		if (type === "TRANSFER") {
			if (!["DEBIT", "CASH"].includes(destType)) {
				throw new BadRequestException(
					`TRANSFER destination must be DEBIT or CASH, got ${destType}`,
				);
			}
		} else if (type === "PAYMENT") {
			if (!["CREDIT", "LOAN"].includes(destType)) {
				throw new BadRequestException(
					`PAYMENT destination must be CREDIT or LOAN, got ${destType}`,
				);
			}
		}
	}

	private async validateAccountOwnership(
		tx: Prisma.TransactionClient,
		accountId: string,
		profileId: string,
	): Promise<Account> {
		const account = await tx.account.findFirst({
			where: { id: accountId, profileId },
		});
		if (!account) {
			throw new NotFoundException("Account not found");
		}
		return account;
	}

	private async validateCategoryOwnership(
		tx: Prisma.TransactionClient,
		categoryId: string | null | undefined,
		profileId: string,
		type: TransactionType,
	): Promise<void> {
		if (!categoryId) return;

		const category = await tx.category.findFirst({
			where: { id: categoryId, profileId },
		});
		if (!category) {
			throw new NotFoundException("Category not found");
		}

		const expectedType = type === "INCOME" ? "INCOME" : "EXPENSE";
		if (category.type !== expectedType) {
			throw new BadRequestException(
				`Category type ${category.type} does not match transaction type ${type}`,
			);
		}
	}
}
