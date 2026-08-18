import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import type { Profile } from "../generated/prisma/client";
import { CardStatementsService } from "./card-statements.service";
import {
	CardStatementResponseDto,
	CreateCardStatementDto,
	QueryCardStatementsDto,
	UpdateCardStatementDto,
} from "./dto/card-statement.dto";

@ApiTags("card-statements")
@ApiBearerAuth()
@Controller("card-statements")
export class CardStatementsController {
	constructor(private readonly cardStatementsService: CardStatementsService) {}

	@Get()
	@ApiOperation({ summary: "List all card statements for the current user with optional filters" })
	@ApiResponse({
		status: 200,
		description: "Returns array of card statements",
		type: ApiSuccessResponseDto<CardStatementResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryCardStatementsDto) {
		return this.cardStatementsService.findAllByProfile(profile.id, {
			creditCardId: query.creditCardId,
			isPaid: query.isPaid === undefined ? undefined : query.isPaid === "true",
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single card statement by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the card statement",
		type: ApiSuccessResponseDto<CardStatementResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Card statement not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.cardStatementsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new card statement" })
	@ApiResponse({
		status: 201,
		description: "Returns the created card statement",
		type: ApiSuccessResponseDto<CardStatementResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Credit card not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateCardStatementDto) {
		return this.cardStatementsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a card statement (mark as paid, adjust amounts)" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated card statement",
		type: ApiSuccessResponseDto<CardStatementResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Card statement not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateCardStatementDto,
	) {
		return this.cardStatementsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a card statement" })
	@ApiResponse({ status: 200, description: "Card statement deleted", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Card statement not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.cardStatementsService.remove(id, profile.id);
		return { message: "Card statement deleted" };
	}
}
