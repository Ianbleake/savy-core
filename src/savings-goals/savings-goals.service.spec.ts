import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { QuerySavingsGoalsDto } from "./dto/savings-goal.dto";
import { SavingsGoalsService } from "./savings-goals.service";

describe("SavingsGoalsService (findAll filters)", () => {
	let service: SavingsGoalsService;
	let prisma: { savingsGoal: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { savingsGoal: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [SavingsGoalsService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(SavingsGoalsService);
	});

	it("uses Prisma orderBy for deadline (DB-sortable)", async () => {
		await service.findAllByProfile("p1", { sortBy: "deadline", order: "asc" });
		const call = prisma.savingsGoal.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ deadline: "asc" });
	});

	it("uses Prisma orderBy for targetAmount (DB-sortable)", async () => {
		await service.findAllByProfile("p1", { sortBy: "targetAmount", order: "desc" });
		const call = prisma.savingsGoal.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ targetAmount: "desc" });
	});

	it("falls back to createdAt desc then sorts currentAmount in memory", async () => {
		prisma.savingsGoal.findMany.mockResolvedValue([
			{
				id: "g1",
				profileId: "p1",
				accountId: "a1",
				name: "G1",
				targetAmount: { toString: () => "100" } as unknown as object,
				deadline: null,
				color: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				account: { balance: { toString: () => "50" } as unknown as object },
			},
			{
				id: "g2",
				profileId: "p1",
				accountId: "a2",
				name: "G2",
				targetAmount: { toString: () => "100" } as unknown as object,
				deadline: null,
				color: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				account: { balance: { toString: () => "80" } as unknown as object },
			},
		]);
		const result = await service.findAllByProfile("p1", { sortBy: "currentAmount", order: "asc" });
		expect(prisma.savingsGoal.findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: "desc" });
		expect(result[0].id).toBe("g1");
		expect(result[1].id).toBe("g2");
	});

	it("filters by isCompleted in memory", async () => {
		prisma.savingsGoal.findMany.mockResolvedValue([
			{
				id: "g1",
				profileId: "p1",
				accountId: "a1",
				name: "G1",
				targetAmount: { toString: () => "100" } as unknown as object,
				deadline: null,
				color: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				account: { balance: { toString: () => "50" } as unknown as object },
			},
			{
				id: "g2",
				profileId: "p1",
				accountId: "a2",
				name: "G2",
				targetAmount: { toString: () => "100" } as unknown as object,
				deadline: null,
				color: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				account: { balance: { toString: () => "100" } as unknown as object },
			},
		]);
		const result = await service.findAllByProfile("p1", { isCompleted: false });
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("g1");
	});
});

describe("QuerySavingsGoalsDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QuerySavingsGoalsDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});
});
