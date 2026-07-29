import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { BanksService } from "./banks.service";
import { QueryBanksDto } from "./dto/bank.dto";

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
