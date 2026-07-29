import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { SavingsGoal } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSavingsGoalDto, UpdateSavingsGoalDto } from "./dto/savings-goal.dto";

export interface SavingsGoalWithComputed extends Omit<SavingsGoal, "targetAmount"> {
	targetAmount: number;
	currentAmount: number;
	isCompleted: boolean;
}

const VALID_ACCOUNT_TYPES = ["DEBIT", "CASH"];

@Injectable()
export class SavingsGoalsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters?: {
			isCompleted?: boolean;
			sortBy?: "deadline" | "targetAmount" | "currentAmount";
			order?: "asc" | "desc";
		},
	): Promise<SavingsGoalWithComputed[]> {
		const sortBy = filters?.sortBy ?? "deadline";
		const order = filters?.order ?? "asc";

		// deadline/targetAmount can be ordered at the DB layer; currentAmount is computed,
		// so we fetch then sort in memory.
		const goals = await this.prisma.savingsGoal.findMany({
			where: { profileId },
			include: { account: { select: { balance: true } } },
			orderBy:
				sortBy === "deadline" || sortBy === "targetAmount"
					? { [sortBy]: order }
					: { createdAt: "desc" },
		});

		let mapped = goals.map((g) => this.withComputed(g));

		if (filters?.isCompleted !== undefined) {
			mapped = mapped.filter((g) => g.isCompleted === filters.isCompleted);
		}

		if (sortBy === "currentAmount") {
			mapped.sort((a, b) => {
				const diff = a.currentAmount - b.currentAmount;
				return order === "asc" ? diff : -diff;
			});
		}

		return mapped;
	}

	async findOne(id: string, profileId: string): Promise<SavingsGoalWithComputed> {
		const goal = await this.prisma.savingsGoal.findFirst({
			where: { id, profileId },
			include: { account: { select: { balance: true } } },
		});
		if (!goal) {
			throw new NotFoundException("Savings goal not found");
		}
		return this.withComputed(goal);
	}

	async create(profileId: string, dto: CreateSavingsGoalDto): Promise<SavingsGoalWithComputed> {
		await this.validateAccount(dto.accountId, profileId);

		const goal = await this.prisma.savingsGoal.create({
			data: {
				profileId,
				accountId: dto.accountId,
				name: dto.name,
				targetAmount: dto.targetAmount,
				deadline: dto.deadline ? new Date(dto.deadline) : null,
				color: dto.color,
			},
			include: { account: { select: { balance: true } } },
		});
		return this.withComputed(goal);
	}

	async update(
		id: string,
		profileId: string,
		dto: UpdateSavingsGoalDto,
	): Promise<SavingsGoalWithComputed> {
		const existing = await this.prisma.savingsGoal.findFirst({
			where: { id, profileId },
		});
		if (!existing) {
			throw new NotFoundException("Savings goal not found");
		}

		if (dto.accountId) {
			await this.validateAccount(dto.accountId, profileId);
		}

		const goal = await this.prisma.savingsGoal.update({
			where: { id },
			data: {
				accountId: dto.accountId ?? existing.accountId,
				name: dto.name ?? existing.name,
				targetAmount: dto.targetAmount ?? existing.targetAmount,
				deadline:
					dto.deadline !== undefined
						? dto.deadline
							? new Date(dto.deadline)
							: null
						: existing.deadline,
				color: dto.color ?? existing.color,
			},
			include: { account: { select: { balance: true } } },
		});
		return this.withComputed(goal);
	}

	async remove(id: string, profileId: string): Promise<void> {
		const goal = await this.prisma.savingsGoal.findFirst({
			where: { id, profileId },
		});
		if (!goal) {
			throw new NotFoundException("Savings goal not found");
		}
		await this.prisma.savingsGoal.delete({ where: { id } });
	}

	private withComputed(
		goal: SavingsGoal & { account: { balance: unknown } },
	): SavingsGoalWithComputed {
		const currentAmount = Number(goal.account.balance);
		const targetAmount = Number(goal.targetAmount);
		return {
			id: goal.id,
			profileId: goal.profileId,
			accountId: goal.accountId,
			name: goal.name,
			targetAmount,
			deadline: goal.deadline,
			color: goal.color,
			currentAmount,
			isCompleted: currentAmount >= targetAmount,
			createdAt: goal.createdAt,
			updatedAt: goal.updatedAt,
		};
	}

	private async validateAccount(accountId: string, profileId: string): Promise<void> {
		const account = await this.prisma.account.findFirst({
			where: { id: accountId, profileId },
			select: { id: true, type: true },
		});
		if (!account) {
			throw new NotFoundException("Account not found");
		}
		if (!VALID_ACCOUNT_TYPES.includes(account.type)) {
			throw new BadRequestException(
				`Savings goal account must be DEBIT or CASH, got ${account.type}`,
			);
		}
	}
}
