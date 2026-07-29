import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { QueryTransactionsDto } from "./dto/transaction.dto";
import { TransactionsService } from "./transactions.service";

describe("TransactionsService", () => {
	let service: TransactionsService;
	let prisma: {
		account: { findMany: jest.Mock };
		transaction: { findMany: jest.Mock; count: jest.Mock };
	};

	beforeEach(async () => {
		prisma = {
			account: { findMany: jest.fn().mockResolvedValue([{ id: "a-1" }]) },
			transaction: {
				findMany: jest.fn().mockResolvedValue([]),
				count: jest.fn().mockResolvedValue(0),
			},
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [TransactionsService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(TransactionsService);
	});

	it("applies sortBy and order to the findMany orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "amount", order: "asc" });

		const call = prisma.transaction.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ amount: "asc" });
	});

	it("defaults sortBy=date and order=desc", async () => {
		await service.findAllByProfile("p1", {});

		const call = prisma.transaction.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ date: "desc" });
	});

	it("includes totalPages in the result", async () => {
		prisma.transaction.count.mockResolvedValue(120);
		const result = await service.findAllByProfile("p1", { limit: 50 });
		expect(result.totalPages).toBe(3);
	});

	it("scopes transactions to a bankId by intersecting owned accounts", async () => {
		prisma.account.findMany
			.mockResolvedValueOnce([{ id: "a-1" }, { id: "a-2" }]) // owned
			.mockResolvedValueOnce([{ id: "a-2" }]); // accounts of the bank
		await service.findAllByProfile("p1", { bankId: "bank-1" });

		const call = prisma.transaction.findMany.mock.calls[0][0];
		expect(call.where.AND[0].OR[0].accountId.in).toEqual(["a-2"]);
	});

	it("applies search as a case-insensitive contains on description", async () => {
		await service.findAllByProfile("p1", { search: "grocery" });

		const call = prisma.transaction.findMany.mock.calls[0][0];
		expect(call.where.AND).toContainEqual({
			description: { contains: "grocery", mode: "insensitive" },
		});
	});
});

describe("QueryTransactionsDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryTransactionsDto, { sortBy: "invalid" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		const fieldErrors = errors.filter((e) => e.property === "sortBy");
		expect(fieldErrors.length).toBeGreaterThan(0);
	});

	it("rejects an invalid order value", async () => {
		const instance = plainToInstance(QueryTransactionsDto, { order: "sideways" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		const fieldErrors = errors.filter((e) => e.property === "order");
		expect(fieldErrors.length).toBeGreaterThan(0);
	});
});
