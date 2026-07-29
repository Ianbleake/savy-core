import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { CreditCardsService } from "./credit-cards.service";
import { QueryCreditCardsDto } from "./dto/credit-card.dto";

describe("CreditCardsService (findAll filters)", () => {
	let service: CreditCardsService;
	let prisma: { creditCard: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { creditCard: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [CreditCardsService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(CreditCardsService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "creditLimit", order: "asc" });
		const call = prisma.creditCard.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ creditLimit: "asc" });
	});

	it("defaults to createdAt desc", async () => {
		await service.findAllByProfile("p1", {});
		const call = prisma.creditCard.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ createdAt: "desc" });
		expect(call.where.account).toEqual({ profileId: "p1" });
	});
});

describe("QueryCreditCardsDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryCreditCardsDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});
});
