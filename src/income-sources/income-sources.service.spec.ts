import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { QueryIncomeSourcesDto } from "./dto/income-source.dto";
import { IncomeSourcesService } from "./income-sources.service";

describe("IncomeSourcesService (findAll filters)", () => {
	let service: IncomeSourcesService;
	let prisma: { incomeSource: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { incomeSource: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [IncomeSourcesService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(IncomeSourcesService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "amount", order: "asc" });
		const call = prisma.incomeSource.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ amount: "asc" });
	});

	it("defaults to createdAt desc and isActive true", async () => {
		await service.findAllByProfile("p1", {});
		const call = prisma.incomeSource.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ createdAt: "desc" });
		expect(call.where.isActive).toBe(true);
	});
});

describe("QueryIncomeSourcesDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryIncomeSourcesDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});
});
