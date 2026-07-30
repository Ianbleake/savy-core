import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import type { Prisma, Profile } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBankDto, UpdateBankDto } from "./dto/bank.dto";
import type { BankSummaryPeriod } from "./dto/bank-summary.dto";
import { BANK_SUMMARY_PERIODS } from "./dto/bank-summary.dto";

const SPANISH_MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

type DecimalLike = Prisma.Decimal | number | { toString(): string };

const toCents = (d: DecimalLike): number => Math.round(Number(d) * 100);

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

	async getSummary(id: string, profile: Profile, period: string) {
		if (!BANK_SUMMARY_PERIODS.includes(period as BankSummaryPeriod)) {
			throw new UnprocessableEntityException("Invalid period value");
		}

		const bank = await this.prisma.bank.findFirst({
			where: { id, profileId: profile.id },
			include: {
				accounts: {
					where: { isActive: true },
					include: { creditCard: true, loan: true },
					orderBy: { createdAt: "desc" },
				},
			},
		});
		if (!bank) {
			throw new NotFoundException("Bank not found");
		}

		let netWorth = 0;
		let liquidity = 0;
		let debt = 0;
		let assets = 0;
		let liabilities = 0;

		for (const account of bank.accounts) {
			const balanceCents = toCents(account.balance);

			// Balance breakdown: assets = positive balances, liabilities = negative abs + loans
			if (balanceCents > 0) {
				assets += balanceCents;
			} else if (balanceCents < 0) {
				liabilities += Math.abs(balanceCents);
			}

			// Net worth per account type
			if (account.type === "DEBIT" || account.type === "CASH") {
				netWorth += balanceCents;
				if (balanceCents > 0) {
					liquidity += balanceCents;
				}
			} else if (account.type === "CREDIT") {
				netWorth += -Math.abs(balanceCents);
				debt += Math.abs(balanceCents);
			} else if (account.type === "LOAN") {
				const remainingCents = account.loan ? toCents(account.loan.remaining) : 0;
				netWorth += -remainingCents;
				debt += remainingCents;
				liabilities += remainingCents;
			}
		}

		const range = this.computePeriodRange(period);

		const accountIds = bank.accounts.map((a) => a.id);
		const transactions =
			accountIds.length > 0
				? await this.prisma.transaction.findMany({
						where: {
							accountId: { in: accountIds },
							type: { in: ["INCOME", "EXPENSE"] },
							date: { gte: range.start, lte: range.end },
						},
						select: { type: true, amount: true, categoryId: true },
					})
				: [];

		let income = 0;
		let expenses = 0;
		const categorySums = new Map<string, number>();

		for (const t of transactions) {
			const cents = toCents(t.amount);
			if (t.type === "INCOME") {
				income += cents;
			} else if (t.type === "EXPENSE") {
				expenses += cents;
				if (t.categoryId) {
					categorySums.set(t.categoryId, (categorySums.get(t.categoryId) ?? 0) + cents);
				}
			}
		}

		const topCategoryEntries = [...categorySums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

		const categoryIds = topCategoryEntries.map(([cid]) => cid);
		const categoryRows =
			categoryIds.length > 0
				? await this.prisma.category.findMany({
						where: { id: { in: categoryIds } },
						select: { id: true, name: true },
					})
				: [];
		const categoryNameById = new Map(categoryRows.map((c) => [c.id, c.name]));

		const topCategories = topCategoryEntries.map(([categoryId, amount]) => ({
			categoryId,
			categoryName: categoryNameById.get(categoryId) ?? "Unknown",
			amount,
			percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
		}));

		const creditCards = bank.accounts.filter((a) => a.creditCard).map((a) => a.creditCard);

		const loans = bank.accounts
			.filter((a) => a.loan)
			.map((a) => {
				const loan = a.loan;
				if (!loan) {
					throw new Error("unreachable");
				}
				const principalCents = toCents(loan.principal);
				const remainingCents = toCents(loan.remaining);
				const progress =
					principalCents > 0
						? Math.round(((principalCents - remainingCents) / principalCents) * 100)
						: 0;
				return {
					id: loan.id,
					accountId: loan.accountId,
					principal: principalCents,
					interestRate: Number(loan.interestRate),
					termMonths: loan.termMonths,
					startDate: loan.startDate.toISOString(),
					monthlyPayment: toCents(loan.monthlyPayment),
					remaining: remainingCents,
					progress,
					createdAt: loan.createdAt.toISOString(),
					updatedAt: loan.updatedAt.toISOString(),
				};
			});

		return {
			bank: {
				id: bank.id,
				name: bank.name,
				color: bank.color,
				logo: bank.logo,
				isActive: bank.isActive,
			},
			netWorth,
			liquidity,
			debt,
			balanceBreakdown: { assets, liabilities },
			incomeVsExpenses: {
				income,
				expenses,
				period: range.label,
				periodLabel: range.periodLabel,
			},
			topCategories,
			accounts: bank.accounts,
			creditCards,
			loans,
			currency: profile.currency,
		};
	}

	private computePeriodRange(period: string): {
		start: Date;
		end: Date;
		label: string;
		periodLabel: string;
	} {
		const now = new Date();
		const year = now.getUTCFullYear();
		const month = now.getUTCMonth();

		const monthLabel = (y: number, m: number): string => `${SPANISH_MONTHS[m]} ${y}`;

		switch (period) {
			case "day": {
				const start = new Date(Date.UTC(year, month, now.getUTCDate()));
				const end = new Date(Date.UTC(year, month, now.getUTCDate(), 23, 59, 59, 999));
				return {
					start,
					end,
					label: `${year}-${String(month + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
					periodLabel: monthLabel(year, month),
				};
			}
			case "week": {
				const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				return {
					start,
					end: now,
					label: `${year}-${String(month + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
					periodLabel: "Últimos 7 días",
				};
			}
			case "month": {
				const start = new Date(Date.UTC(year, month, 1));
				const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
				return {
					start,
					end,
					label: `${year}-${String(month + 1).padStart(2, "0")}`,
					periodLabel: monthLabel(year, month),
				};
			}
			case "other_month": {
				const prevMonth = month === 0 ? 11 : month - 1;
				const prevYear = month === 0 ? year - 1 : year;
				const start = new Date(Date.UTC(prevYear, prevMonth, 1));
				const end = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999));
				return {
					start,
					end,
					label: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}`,
					periodLabel: monthLabel(prevYear, prevMonth),
				};
			}
			case "quarter": {
				const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				return {
					start,
					end: now,
					label: `${year}-${String(month + 1).padStart(2, "0")}`,
					periodLabel: "Últimos 3 meses",
				};
			}
			case "semester": {
				const start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
				return {
					start,
					end: now,
					label: `${year}-${String(month + 1).padStart(2, "0")}`,
					periodLabel: "Últimos 6 meses",
				};
			}
			case "year": {
				const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				return {
					start,
					end: now,
					label: `${year}`,
					periodLabel: "Últimos 12 meses",
				};
			}
			default: {
				const start = new Date(Date.UTC(year, month, 1));
				const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
				return {
					start,
					end,
					label: `${year}-${String(month + 1).padStart(2, "0")}`,
					periodLabel: monthLabel(year, month),
				};
			}
		}
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
