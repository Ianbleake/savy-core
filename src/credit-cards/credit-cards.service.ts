import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreditCard } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCreditCardDto, UpdateCreditCardDto } from "./dto/credit-card.dto";

@Injectable()
export class CreditCardsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters?: {
			sortBy?: "createdAt" | "creditLimit";
			order?: "asc" | "desc";
		},
	): Promise<CreditCard[]> {
		const sortBy = filters?.sortBy ?? "createdAt";
		const order = filters?.order ?? "desc";
		return this.prisma.creditCard.findMany({
			where: { account: { profileId } },
			orderBy: { [sortBy]: order },
		});
	}

	async findOne(id: string, profileId: string): Promise<CreditCard> {
		const card = await this.prisma.creditCard.findFirst({
			where: { id, account: { profileId } },
		});
		if (!card) {
			throw new NotFoundException("Credit card not found");
		}
		return card;
	}

	async create(profileId: string, dto: CreateCreditCardDto): Promise<CreditCard> {
		await this.validateAccount(dto.accountId, profileId);

		const existing = await this.prisma.creditCard.findUnique({
			where: { accountId: dto.accountId },
			select: { id: true },
		});
		if (existing) {
			throw new BadRequestException("This account already has a credit card associated");
		}

		return this.prisma.creditCard.create({
			data: {
				accountId: dto.accountId,
				creditLimit: dto.creditLimit,
				cutDay: dto.cutDay,
				paymentDay: dto.paymentDay,
				interestRate: dto.interestRate,
				noInterestMonths: dto.noInterestMonths ?? 0,
			},
		});
	}

	async update(id: string, profileId: string, dto: UpdateCreditCardDto): Promise<CreditCard> {
		await this.findOne(id, profileId);
		return this.prisma.creditCard.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOne(id, profileId);
		await this.prisma.creditCard.delete({ where: { id } });
	}

	private async validateAccount(accountId: string, profileId: string): Promise<void> {
		const account = await this.prisma.account.findFirst({
			where: { id: accountId, profileId },
			select: { id: true, type: true },
		});
		if (!account) {
			throw new NotFoundException("Account not found");
		}
		if (account.type !== "CREDIT") {
			throw new BadRequestException("Account must be of type CREDIT");
		}
	}
}
