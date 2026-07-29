import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { CategoriesService } from "./categories.service";
import { QueryCategoriesDto } from "./dto/category.dto";

describe("CategoriesService (findAll filters)", () => {
	let service: CategoriesService;
	let prisma: { category: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { category: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [CategoriesService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(CategoriesService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "name", order: "asc" });
		const call = prisma.category.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ name: "asc" });
	});

	it("passes a type filter through", async () => {
		await service.findAllByProfile("p1", { type: "EXPENSE" });
		const call = prisma.category.findMany.mock.calls[0][0];
		expect(call.where.type).toBe("EXPENSE");
	});
});

describe("QueryCategoriesDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryCategoriesDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});

	it("rejects an invalid type value", async () => {
		const instance = plainToInstance(QueryCategoriesDto, { type: "SAVINGS" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "type")).toBe(true);
	});
});
