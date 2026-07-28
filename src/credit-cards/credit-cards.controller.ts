import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import { CreditCardResponseDto, CreateCreditCardDto, UpdateCreditCardDto } from "./dto/credit-card.dto";
import { CreditCardsService } from "./credit-cards.service";

@ApiTags("credit-cards")
@ApiBearerAuth()
@Controller("credit-cards")
export class CreditCardsController {
	constructor(private readonly creditCardsService: CreditCardsService) {}

	@Get()
	@ApiOperation({ summary: "List all credit cards for the current user" })
	@ApiResponse({ status: 200, description: "Returns array of credit cards", type: [CreditCardResponseDto] })
	async findAll(@CurrentUser() profile: Profile) {
		return this.creditCardsService.findAllByProfile(profile.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single credit card by ID" })
	@ApiResponse({ status: 200, description: "Returns the credit card", type: CreditCardResponseDto })
	@ApiResponse({ status: 404, description: "Credit card not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.creditCardsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create credit card details for a CREDIT account" })
	@ApiResponse({ status: 201, description: "Returns the created credit card", type: CreditCardResponseDto })
	@ApiResponse({ status: 400, description: "Account must be CREDIT type or already has a card" })
	@ApiResponse({ status: 404, description: "Account not found" })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateCreditCardDto) {
		return this.creditCardsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a credit card by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated credit card", type: CreditCardResponseDto })
	@ApiResponse({ status: 404, description: "Credit card not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateCreditCardDto,
	) {
		return this.creditCardsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete credit card details (the account survives)" })
	@ApiResponse({ status: 200, description: "Credit card deleted" })
	@ApiResponse({ status: 404, description: "Credit card not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.creditCardsService.remove(id, profile.id);
		return { message: "Credit card deleted" };
	}
}