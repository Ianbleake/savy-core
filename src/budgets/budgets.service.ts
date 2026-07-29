import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Budget, BudgetPeriod } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetDto, UpdateBudgetDto } from "./dto/budget.dto";

@Injectable()
export class BudgetsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters?: {
			isActive?: boolean;
			period?: BudgetPeriod;
			sortBy?: "amount" | "startDate";
			order?: "asc" | "desc";
		},
	): Promise<Budget[]> {
		const isActive = filters?.isActive ?? true;
		const sortBy = filters?.sortBy ?? "startDate";
		const order = filters?.order ?? "desc";

		return this.prisma.budget.findMany({
			where: {
				profileId,
				isActive,
				...(filters?.period ? { period: filters.period } : {}),
			},
			orderBy: { [sortBy]: order },
		});
	}

	async findOne(id: string, profileId: string): Promise<Budget> {
		const budget = await this.prisma.budget.findFirst({
			where: { id, profileId },
		});
		if (!budget) {
			throw new NotFoundException("Budget not found");
		}
		return budget;
	}

	async create(profileId: string, dto: CreateBudgetDto): Promise<Budget> {
		await this.validateCategory(dto.categoryId, profileId);

		return this.prisma.budget.create({
			data: {
				profileId,
				categoryId: dto.categoryId,
				amount: dto.amount,
				period: dto.period,
				startDate: new Date(dto.startDate),
				endDate: dto.endDate ? new Date(dto.endDate) : null,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateBudgetDto): Promise<Budget> {
		const existing = await this.findOne(id, profileId);

		if (dto.categoryId) {
			await this.validateCategory(dto.categoryId, profileId);
		}

		return this.prisma.budget.update({
			where: { id },
			data: {
				categoryId: dto.categoryId ?? existing.categoryId,
				amount: dto.amount ?? existing.amount,
				period: dto.period ?? existing.period,
				startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
				endDate:
					dto.endDate !== undefined
						? dto.endDate
							? new Date(dto.endDate)
							: null
						: existing.endDate,
			},
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOne(id, profileId);
		await this.prisma.budget.update({
			where: { id },
			data: { isActive: false },
		});
	}

	async getProgress(
		id: string,
		profileId: string,
	): Promise<{
		spent: number;
		budget: number;
		remaining: number;
		percentage: number;
		periodStart: Date;
		periodEnd: Date;
	}> {
		const budget = await this.findOne(id, profileId);
		const { periodStart, periodEnd } = this.computeCurrentPeriod(budget.startDate, budget.period);

		// Sum all EXPENSE transactions in this category within the period
		// across all accounts owned by the user
		const accountIds = await this.getAccountIds(profileId);

		const result = await this.prisma.transaction.aggregate({
			where: {
				type: "EXPENSE",
				categoryId: budget.categoryId,
				accountId: { in: accountIds },
				date: { gte: periodStart, lte: periodEnd },
			},
			_sum: { amount: true },
		});

		const spent = result._sum.amount ? Number(result._sum.amount) : 0;
		const budgetAmount = Number(budget.amount);
		const remaining = budgetAmount - spent;
		const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

		return {
			spent,
			budget: budgetAmount,
			remaining,
			percentage,
			periodStart,
			periodEnd,
		};
	}

	/**
	 * Compute progress for ALL active budgets of a profile in a single pass.
	 * Reused by DashboardService to avoid duplicating period logic.
	 */
	async getProgressForAll(profileId: string): Promise<
		Array<{
			id: string;
			categoryName: string;
			spent: number;
			budget: number;
			remaining: number;
			percentage: number;
		}>
	> {
		const budgets = await this.prisma.budget.findMany({
			where: { profileId, isActive: true },
			include: { category: { select: { name: true } } },
		});

		if (budgets.length === 0) {
			return [];
		}

		const accountIds = await this.getAccountIds(profileId);

		const results = await Promise.all(
			budgets.map(async (budget) => {
				const { periodStart, periodEnd } = this.computeCurrentPeriod(
					budget.startDate,
					budget.period,
				);

				const agg = await this.prisma.transaction.aggregate({
					where: {
						type: "EXPENSE",
						categoryId: budget.categoryId,
						accountId: { in: accountIds },
						date: { gte: periodStart, lte: periodEnd },
					},
					_sum: { amount: true },
				});

				const spent = agg._sum.amount ? Number(agg._sum.amount) : 0;
				const budgetAmount = Number(budget.amount);
				const remaining = budgetAmount - spent;
				const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

				return {
					id: budget.id,
					categoryName: budget.category.name,
					spent,
					budget: budgetAmount,
					remaining,
					percentage,
				};
			}),
		);

		return results;
	}

	private async getAccountIds(profileId: string): Promise<string[]> {
		const accounts = await this.prisma.account.findMany({
			where: { profileId },
			select: { id: true },
		});
		return accounts.map((a) => a.id);
	}

	private computeCurrentPeriod(
		startDate: Date,
		period: BudgetPeriod,
	): {
		periodStart: Date;
		periodEnd: Date;
	} {
		const now = new Date();
		const start = new Date(startDate);

		const periodMs: Record<BudgetPeriod, number> = {
			WEEKLY: 7 * 24 * 60 * 60 * 1000,
			BIWEEKLY: 14 * 24 * 60 * 60 * 1000,
			MONTHLY: 30 * 24 * 60 * 60 * 1000, // approximate, adjusted below
			YEARLY: 365 * 24 * 60 * 60 * 1000, // approximate, adjusted below
		};

		// For WEEKLY and BIWEEKLY, use fixed ms math
		if (period === "WEEKLY" || period === "BIWEEKLY") {
			const elapsed = now.getTime() - start.getTime();
			const cyclesPassed = Math.floor(elapsed / periodMs[period]);
			const periodStart = new Date(start.getTime() + cyclesPassed * periodMs[period]);
			const periodEnd = new Date(periodStart.getTime() + periodMs[period] - 1);
			return { periodStart, periodEnd };
		}

		// For MONTHLY and YEARLY, use calendar math to avoid drift
		if (period === "MONTHLY") {
			const startDay = start.getUTCDate();
			const startMonth = start.getUTCMonth();
			const startYear = start.getUTCFullYear();

			// Find the most recent cycle start
			let cycleYear = now.getUTCFullYear();
			let cycleMonth = now.getUTCMonth();

			// If today's day is before the start day, we're in the previous cycle
			if (now.getUTCDate() < startDay) {
				cycleMonth -= 1;
				if (cycleMonth < 0) {
					cycleMonth = 11;
					cycleYear -= 1;
				}
			}

			// Count months from original start to find the exact cycle
			const monthsSinceStart = (cycleYear - startYear) * 12 + (cycleMonth - startMonth);
			const adjustedMonths = Math.max(0, monthsSinceStart);

			const periodStart = new Date(
				Date.UTC(startYear, startMonth + adjustedMonths, startDay, 0, 0, 0, 0),
			);
			const periodEnd = new Date(
				Date.UTC(startYear, startMonth + adjustedMonths + 1, startDay, 0, 0, 0, -1),
			);
			return { periodStart, periodEnd };
		}

		// YEARLY
		const startDay = start.getUTCDate();
		const startMonth = start.getUTCMonth();
		const startYear = start.getUTCFullYear();

		let cycleYear = now.getUTCFullYear();
		if (
			now.getUTCMonth() < startMonth ||
			(now.getUTCMonth() === startMonth && now.getUTCDate() < startDay)
		) {
			cycleYear -= 1;
		}

		const yearsSinceStart = Math.max(0, cycleYear - startYear);
		const periodStart = new Date(
			Date.UTC(startYear + yearsSinceStart, startMonth, startDay, 0, 0, 0, 0),
		);
		const periodEnd = new Date(
			Date.UTC(startYear + yearsSinceStart + 1, startMonth, startDay, 0, 0, 0, -1),
		);
		return { periodStart, periodEnd };
	}

	private async validateCategory(categoryId: string, profileId: string): Promise<void> {
		const category = await this.prisma.category.findFirst({
			where: { id: categoryId, profileId },
			select: { id: true, type: true },
		});
		if (!category) {
			throw new NotFoundException("Category not found");
		}
		if (category.type !== "EXPENSE") {
			throw new BadRequestException("Budget category must be of type EXPENSE");
		}
	}
}
