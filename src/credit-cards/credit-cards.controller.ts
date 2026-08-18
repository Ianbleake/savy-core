import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import type { Profile } from "../generated/prisma/client";
import { CreditCardsService } from "./credit-cards.service";
import {
	CreateCreditCardDto,
	CreditCardResponseDto,
	QueryCreditCardsDto,
	UpdateCreditCardDto,
} from "./dto/credit-card.dto";

@ApiTags("credit-cards")
@ApiBearerAuth()
@Controller("credit-cards")
export class CreditCardsController {
	constructor(private readonly creditCardsService: CreditCardsService) {}

	@Get()
	@ApiOperation({ summary: "List all credit cards for the current user with optional sort" })
	@ApiResponse({
		status: 200,
		description: "Returns array of credit cards",
		type: ApiSuccessResponseDto<CreditCardResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryCreditCardsDto) {
		return this.creditCardsService.findAllByProfile(profile.id, {
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single credit card by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the credit card",
		type: ApiSuccessResponseDto<CreditCardResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Credit card not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.creditCardsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create credit card details for a CREDIT account" })
	@ApiResponse({
		status: 201,
		description: "Returns the created credit card",
		type: ApiSuccessResponseDto<CreditCardResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or account must be CREDIT type or already has a card",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Account not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateCreditCardDto) {
		return this.creditCardsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a credit card by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated credit card",
		type: ApiSuccessResponseDto<CreditCardResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Credit card not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateCreditCardDto,
	) {
		return this.creditCardsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete credit card details (the account survives)" })
	@ApiResponse({ status: 200, description: "Credit card deleted", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Credit card not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.creditCardsService.remove(id, profile.id);
		return { message: "Credit card deleted" };
	}
}
