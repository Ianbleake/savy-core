import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { AccountsService } from "./accounts.service";
import { QueryAccountsDto } from "./dto/account.dto";

describe("AccountsService", () => {
	let service: AccountsService;
	let prisma: { account: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { account: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [AccountsService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(AccountsService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "balance", order: "asc" });
		const call = prisma.account.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ balance: "asc" });
	});

	it("defaults to createdAt desc and isActive=true", async () => {
		await service.findAllByProfile("p1", {});
		const call = prisma.account.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ createdAt: "desc" });
		expect(call.where.isActive).toBe(true);
	});

	it("passes a bankId filter through", async () => {
		await service.findAllByProfile("p1", { bankId: "bank-1" });
		const call = prisma.account.findMany.mock.calls[0][0];
		expect(call.where.bankId).toBe("bank-1");
	});

	it("honors isActive=false as a boolean", async () => {
		await service.findAllByProfile("p1", { isActive: false });
		const call = prisma.account.findMany.mock.calls[0][0];
		expect(call.where.isActive).toBe(false);
	});
});

describe("QueryAccountsDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryAccountsDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});

	it("rejects an invalid type value", async () => {
		const instance = plainToInstance(QueryAccountsDto, { type: "SAVINGS" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "type")).toBe(true);
	});
});
