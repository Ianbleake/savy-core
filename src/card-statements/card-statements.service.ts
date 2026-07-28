import { Injectable, NotFoundException } from "@nestjs/common";
import type { CardStatement } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCardStatementDto, UpdateCardStatementDto } from "./dto/card-statement.dto";

@Injectable()
export class CardStatementsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(profileId: string, creditCardId?: string): Promise<CardStatement[]> {
		return this.prisma.cardStatement.findMany({
			where: {
				creditCard: {
					account: { profileId },
				},
				...(creditCardId ? { creditCardId } : {}),
			},
			orderBy: { periodEnd: "desc" },
		});
	}

	async findOne(id: string, profileId: string): Promise<CardStatement> {
		const statement = await this.prisma.cardStatement.findFirst({
			where: {
				id,
				creditCard: { account: { profileId } },
			},
		});
		if (!statement) {
			throw new NotFoundException("Card statement not found");
		}
		return statement;
	}

	async create(profileId: string, dto: CreateCardStatementDto): Promise<CardStatement> {
		await this.validateCreditCard(dto.creditCardId, profileId);

		return this.prisma.cardStatement.create({
			data: {
				creditCardId: dto.creditCardId,
				periodStart: new Date(dto.periodStart),
				periodEnd: new Date(dto.periodEnd),
				balance: dto.balance,
				minPayment: dto.minPayment,
				noInterestPayment: dto.noInterestPayment,
				interestAmount: dto.interestAmount ?? 0,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateCardStatementDto): Promise<CardStatement> {
		await this.findOne(id, profileId);
		return this.prisma.cardStatement.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOne(id, profileId);
		await this.prisma.cardStatement.delete({ where: { id } });
	}

	private async validateCreditCard(creditCardId: string, profileId: string): Promise<void> {
		const card = await this.prisma.creditCard.findFirst({
			where: { id: creditCardId, account: { profileId } },
			select: { id: true },
		});
		if (!card) {
			throw new NotFoundException("Credit card not found");
		}
	}
}