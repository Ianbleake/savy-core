import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { QueryLoansDto } from "./dto/loan.dto";
import { LoansService } from "./loans.service";

describe("LoansService (findAll filters)", () => {
	let service: LoansService;
	let prisma: { loan: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { loan: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [LoansService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(LoansService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "remaining", order: "asc" });
		const call = prisma.loan.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ remaining: "asc" });
	});

	it("defaults to createdAt desc and scopes by profile through account", async () => {
		await service.findAllByProfile("p1", {});
		const call = prisma.loan.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ createdAt: "desc" });
		expect(call.where.account).toEqual({ profileId: "p1" });
	});
});

describe("QueryLoansDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryLoansDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});
});
