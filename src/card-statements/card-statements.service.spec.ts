import { Test, type TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { CardStatementsService } from "./card-statements.service";
import { QueryCardStatementsDto } from "./dto/card-statement.dto";

describe("CardStatementsService (findAll filters)", () => {
	let service: CardStatementsService;
	let prisma: { cardStatement: { findMany: jest.Mock } };

	beforeEach(async () => {
		prisma = { cardStatement: { findMany: jest.fn().mockResolvedValue([]) } };
		const module: TestingModule = await Test.createTestingModule({
			providers: [CardStatementsService, { provide: PrismaService, useValue: prisma }],
		}).compile();
		service = module.get(CardStatementsService);
	});

	it("applies sortBy and order to orderBy", async () => {
		await service.findAllByProfile("p1", { sortBy: "periodEnd", order: "asc" });
		const call = prisma.cardStatement.findMany.mock.calls[0][0];
		expect(call.orderBy).toEqual({ periodEnd: "asc" });
	});

	it("passes creditCardId and isPaid filters through", async () => {
		await service.findAllByProfile("p1", { creditCardId: "card-1", isPaid: false });
		const call = prisma.cardStatement.findMany.mock.calls[0][0];
		expect(call.where.creditCardId).toBe("card-1");
		expect(call.where.isPaid).toBe(false);
	});
});

describe("QueryCardStatementsDto validation", () => {
	it("rejects an invalid sortBy value", async () => {
		const instance = plainToInstance(QueryCardStatementsDto, { sortBy: "bogus" });
		const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.some((e) => e.property === "sortBy")).toBe(true);
	});
});
