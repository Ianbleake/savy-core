import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Profile } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BanksService } from "./banks.service";
import { QueryBanksDto } from "./dto/bank.dto";
import { BANK_SUMMARY_PERIODS, QueryBankSummaryDto } from "./dto/bank-summary.dto";

// Helper to build a Prisma Decimal-like value. Prisma's Decimal accepts numbers,
// so we mimic the Decimal interface just enough for Number() to work.
const D = (n: number): { toString(): string; valueOf(): number } => ({
	toString: () => String(n),
	valueOf: () => n,
});

describe("BanksService (findAll filters)", () => {
	let service: BanksService;
	let prisma: { bank: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { bank: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [BanksService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(BanksService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "name", order: "desc" });
		const call = prisma.bank.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ name: "desc" });
	});

	it("defaults to name asc and isActive true", async () => {
		await service.findAllByProfile("p1", {});
		const call = prisma.bank.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ name: "asc" });
		expect(call.where.isActive).toBe(true);
	});

	it("honors isActive=false", async () => {
		await service.findAllByProfile("p1", { isActive: false });
		const call = prisma.bank.findMany.mock.calls[0][0];
		expect(call.where.isActive).toBe(false);
	});
});

describe("QueryBanksDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryBanksDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});
});

const baseProfile: Profile = {
	id: "profile-1",
	authId: "auth-1",
	email: "test@test.com",
	firstName: "Test",
	lastName: "User",
	secondLastName: null,
	avatarUrl: null,
	phone: null,
	currency: "MXN",
	locale: "es-MX",
	timezone: "America/Mexico_City",
	onboardingCompleted: true,
	createdAt: new Date(),
	updatedAt: new Date(),
} as unknown as Profile;

function makeBank(overrides: Record<string, unknown> = {}) {
	return {
		id: "bank-1",
		profileId: "profile-1",
		name: "BBVA",
		color: "#0d9488",
		logo: "bbva",
		isActive: true,
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		accounts: [],
		...overrides,
	};
}

function makeAccount(overrides: Record<string, unknown> = {}) {
	return {
		id: "acc-1",
		profileId: "profile-1",
		bankId: "bank-1",
		name: "Checking",
		type: "DEBIT",
		currency: "MXN",
		balance: D(1000),
		color: null,
		icon: null,
		isActive: true,
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		creditCard: null,
		loan: null,
		...overrides,
	};
}

function makeLoan(overrides: Record<string, unknown> = {}) {
	return {
		id: "loan-1",
		accountId: "acc-3",
		principal: D(200000),
		interestRate: D(0.165),
		termMonths: 36,
		startDate: new Date("2024-01-15T00:00:00.000Z"),
		monthlyPayment: D(6800),
		remaining: D(150000),
		createdAt: new Date("2024-01-15T00:00:00.000Z"),
		updatedAt: new Date("2026-07-01T00:00:00.000Z"),
		...overrides,
	};
}

describe("BanksService.getSummary", () => {
	let service: BanksService;
	let prisma: {
		bank: { findFirst: jest.Mock };
		transaction: { findMany: jest.Mock };
		category: { findMany: jest.Mock };
	};

	beforeEach(async () => {
		prisma = {
			bank: { findFirst: jest.fn() },
			transaction: { findMany: jest.fn().mockResolvedValue([]) },
			category: { findMany: jest.fn().mockResolvedValue([]) },
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [BanksService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(BanksService);
	});

	it("throws NotFoundException when bank doesn't exist", async () => {
		prisma.bank.findFirst.mockResolvedValue(null);
		await expect(service.getSummary("nope", baseProfile, "month")).rejects.toThrow(
			NotFoundException,
		);
	});

	it("throws UnprocessableEntityException for invalid period", async () => {
		prisma.bank.findFirst.mockResolvedValue(makeBank());
		await expect(service.getSummary("bank-1", baseProfile, "invalid_period")).rejects.toThrow(
			UnprocessableEntityException,
		);
	});

	it("computes netWorth correctly with mixed account types", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({ id: "a1", type: "DEBIT", balance: D(1500) }),
					makeAccount({ id: "a2", type: "CREDIT", balance: D(-500) }),
					makeAccount({
						id: "a3",
						type: "LOAN",
						balance: D(-2000),
						loan: makeLoan({ remaining: D(100000) }),
					}),
					makeAccount({ id: "a4", type: "CASH", balance: D(300) }),
				],
			}),
		);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		// netWorth = 150000 + (-50000) + (-10000000) + 30000 = -9820000
		expect(result.netWorth).toBe(150000 - 50000 - 10000000 + 30000);
	});

	it("computes liquidity correctly (DEBIT + CASH with positive balance only)", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({ id: "a1", type: "DEBIT", balance: D(1500) }),
					makeAccount({ id: "a2", type: "CASH", balance: D(300) }),
					makeAccount({ id: "a3", type: "CREDIT", balance: D(5000) }),
					makeAccount({
						id: "a4",
						type: "LOAN",
						balance: D(-100),
						loan: makeLoan({ remaining: D(50000) }),
					}),
					makeAccount({ id: "a5", type: "DEBIT", balance: D(-200) }),
				],
			}),
		);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		// liquidity = 150000 + 30000 = 180000 (DEBIT -200 excluded, CREDIT excluded, LOAN excluded)
		expect(result.liquidity).toBe(150000 + 30000);
	});

	it("computes debt correctly (CREDIT abs balance + loan remaining)", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({ id: "a1", type: "CREDIT", balance: D(-800) }),
					makeAccount({
						id: "a2",
						type: "LOAN",
						balance: D(-2000),
						loan: makeLoan({ remaining: D(120000) }),
					}),
					makeAccount({ id: "a3", type: "DEBIT", balance: D(5000) }),
				],
			}),
		);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		// debt = 80000 + 12000000 = 12080000
		expect(result.debt).toBe(80000 + 12000000);
	});

	it("computes balance breakdown correctly", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({ id: "a1", type: "DEBIT", balance: D(2000) }),
					makeAccount({ id: "a2", type: "CREDIT", balance: D(-600) }),
					makeAccount({
						id: "a3",
						type: "LOAN",
						balance: D(-100),
						loan: makeLoan({ remaining: D(50000) }),
					}),
				],
			}),
		);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		// assets = 200000 (positive balance only)
		// liabilities = 60000 (abs negative CREDIT) + 10000 (abs negative LOAN balance) + 5000000 (loan) = 5070000
		expect(result.balanceBreakdown.assets).toBe(200000);
		expect(result.balanceBreakdown.liabilities).toBe(60000 + 10000 + 5000000);
	});

	it("computes income vs expenses from transactions", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [makeAccount({ id: "a1" })],
			}),
		);
		prisma.transaction.findMany.mockResolvedValue([
			{ type: "INCOME", amount: D(2500), categoryId: null },
			{ type: "EXPENSE", amount: D(800), categoryId: "cat-1" },
			{ type: "EXPENSE", amount: D(1200), categoryId: "cat-2" },
			{ type: "EXPENSE", amount: D(500), categoryId: "cat-1" },
		]);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		// income = 250000, expenses = 80000 + 120000 + 50000 = 250000
		expect(result.incomeVsExpenses.income).toBe(250000);
		expect(result.incomeVsExpenses.expenses).toBe(250000);
	});

	it("computes top categories sorted by amount, max 5, with percentages", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [makeAccount({ id: "a1" })],
			}),
		);
		prisma.transaction.findMany.mockResolvedValue([
			{ type: "EXPENSE", amount: D(1000), categoryId: "cat-1" },
			{ type: "EXPENSE", amount: D(3000), categoryId: "cat-2" },
			{ type: "EXPENSE", amount: D(500), categoryId: "cat-1" },
			{ type: "EXPENSE", amount: D(200), categoryId: "cat-3" },
		]);
		prisma.category.findMany.mockResolvedValue([
			{ id: "cat-2", name: "Rent" },
			{ id: "cat-1", name: "Food" },
			{ id: "cat-3", name: "Transport" },
		]);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		// cat-2: 300000, cat-1: 150000, cat-3: 20000 → total expenses = 470000
		// percentages: cat-2 = 64, cat-1 = 32, cat-3 = 4
		expect(result.topCategories).toHaveLength(3);
		expect(result.topCategories[0].categoryId).toBe("cat-2");
		expect(result.topCategories[0].amount).toBe(300000);
		expect(result.topCategories[0].percentage).toBe(Math.round((300000 / 470000) * 100));
		expect(result.topCategories[1].categoryId).toBe("cat-1");
		expect(result.topCategories[1].amount).toBe(150000);
		expect(result.topCategories[2].categoryId).toBe("cat-3");
		expect(result.topCategories[2].amount).toBe(20000);
	});

	it("top categories returns empty array when no expenses", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [makeAccount({ id: "a1" })],
			}),
		);
		prisma.transaction.findMany.mockResolvedValue([
			{ type: "INCOME", amount: D(1000), categoryId: null },
		]);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		expect(result.topCategories).toEqual([]);
	});

	it("builds loans array with progress and cents conversion", async () => {
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({
						id: "a3",
						type: "LOAN",
						balance: D(-2000),
						loan: makeLoan({
							principal: D(200000),
							remaining: D(150000),
							monthlyPayment: D(6800),
							interestRate: D(0.165),
							termMonths: 36,
						}),
					}),
				],
			}),
		);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		expect(result.loans).toHaveLength(1);
		const loan = result.loans[0];
		expect(loan.id).toBe("loan-1");
		expect(loan.accountId).toBe("acc-3");
		expect(loan.principal).toBe(20000000);
		expect(loan.remaining).toBe(15000000);
		expect(loan.monthlyPayment).toBe(680000);
		expect(loan.interestRate).toBe(0.165);
		expect(loan.termMonths).toBe(36);
		// progress = ((20000000 - 15000000) / 20000000) * 100 = 25
		expect(loan.progress).toBe(25);
		expect(typeof loan.startDate).toBe("string");
		expect(typeof loan.createdAt).toBe("string");
		expect(typeof loan.updatedAt).toBe("string");
	});

	it("extracts creditCards from accounts relation", async () => {
		const card = {
			id: "card-1",
			accountId: "a2",
			creditLimit: D(50000),
			cutDay: 15,
			paymentDay: 25,
			interestRate: D(0.36),
			noInterestMonths: 12,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({ id: "a1", type: "DEBIT", creditCard: null }),
					makeAccount({ id: "a2", type: "CREDIT", creditCard: card }),
				],
			}),
		);
		const result = await service.getSummary("bank-1", baseProfile, "month");
		expect(result.creditCards).toHaveLength(1);
		expect(result.creditCards[0]).toBe(card);
	});

	it("returns full response shape with all fields populated", async () => {
		const loanData = makeLoan({
			principal: D(100000),
			remaining: D(40000),
			monthlyPayment: D(3000),
		});
		const cardData = {
			id: "card-1",
			accountId: "a2",
			creditLimit: D(50000),
			cutDay: 15,
			paymentDay: 25,
			interestRate: D(0.36),
			noInterestMonths: 12,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		prisma.bank.findFirst.mockResolvedValue(
			makeBank({
				accounts: [
					makeAccount({ id: "a1", type: "DEBIT", balance: D(5000) }),
					makeAccount({ id: "a2", type: "CREDIT", balance: D(-1500), creditCard: cardData }),
					makeAccount({
						id: "a3",
						type: "LOAN",
						balance: D(-1000),
						loan: loanData,
					}),
				],
			}),
		);
		prisma.transaction.findMany.mockResolvedValue([
			{ type: "INCOME", amount: D(3000), categoryId: null },
			{ type: "EXPENSE", amount: D(1000), categoryId: "cat-1" },
		]);
		prisma.category.findMany.mockResolvedValue([{ id: "cat-1", name: "Food" }]);

		const result = await service.getSummary("bank-1", baseProfile, "month");

		expect(result.bank).toEqual({
			id: "bank-1",
			name: "BBVA",
			color: "#0d9488",
			logo: "bbva",
			isActive: true,
		});
		expect(result.netWorth).toBe(500000 - 150000 - 4000000);
		expect(result.liquidity).toBe(500000);
		expect(result.debt).toBe(150000 + 4000000);
		expect(result.balanceBreakdown).toEqual({
			assets: 500000,
			liabilities: 150000 + 100000 + 4000000,
		});
		expect(result.incomeVsExpenses.income).toBe(300000);
		expect(result.incomeVsExpenses.expenses).toBe(100000);
		expect(result.incomeVsExpenses.period).toMatch(/^\d{4}-\d{2}$/);
		expect(typeof result.incomeVsExpenses.periodLabel).toBe("string");
		expect(result.topCategories).toHaveLength(1);
		expect(result.topCategories[0]).toEqual({
			categoryId: "cat-1",
			categoryName: "Food",
			amount: 100000,
			percentage: 100,
		});
		expect(result.accounts).toHaveLength(3);
		expect(result.creditCards).toHaveLength(1);
		expect(result.loans).toHaveLength(1);
		expect(result.loans[0].progress).toBe(60);
		expect(result.currency).toBe("MXN");
	});

	it("handles empty accounts gracefully", async () => {
		prisma.bank.findFirst.mockResolvedValue(makeBank({ accounts: [] }));
		const result = await service.getSummary("bank-1", baseProfile, "month");
		expect(result.netWorth).toBe(0);
		expect(result.liquidity).toBe(0);
		expect(result.debt).toBe(0);
		expect(result.balanceBreakdown).toEqual({ assets: 0, liabilities: 0 });
		expect(result.incomeVsExpenses.income).toBe(0);
		expect(result.incomeVsExpenses.expenses).toBe(0);
		expect(result.topCategories).toEqual([]);
		expect(result.accounts).toEqual([]);
		expect(result.creditCards).toEqual([]);
		expect(result.loans).toEqual([]);
	});
});

describe("QueryBankSummaryDto validation", () => {
	it("accepts all valid period values", async () => {
		for (const period of BANK_SUMMARY_PERIODS) {
			const instance = plainToInstance(QueryBankSummaryDto, { period });
			const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
			expect(errors).toHaveLength(0);
		}
	});

	it("accepts any string (validation is deferred to the service layer as 422)", async () => {
		const instance = plainToInstance(QueryBankSummaryDto, { period: "invalid_period" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors).toHaveLength(0);
	});

	it("allows missing period (defaults applied in controller)", async () => {
		const instance = plainToInstance(QueryBankSummaryDto, {});
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors).toHaveLength(0);
	});
});
