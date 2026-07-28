import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import {
	BulkCreateResponseDto,
	CreateIncomeSourceDto,
	IncomeSourceResponseDto,
	UpdateIncomeSourceDto,
} from "./dto/income-source.dto";
import { IncomeSourcesService } from "./income-sources.service";

@ApiTags("income-sources")
@ApiBearerAuth()
@Controller("income-sources")
export class IncomeSourcesController {
	constructor(private readonly incomeSourcesService: IncomeSourcesService) {}

	@Get()
	@ApiOperation({ summary: "List all active income sources for the current user" })
	@ApiResponse({ status: 200, description: "Returns array of income sources", type: [IncomeSourceResponseDto] })
	async findAll(@CurrentUser() profile: Profile) {
		return this.incomeSourcesService.findAllByProfile(profile.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single income source by ID" })
	@ApiResponse({ status: 200, description: "Returns the income source", type: IncomeSourceResponseDto })
	@ApiResponse({ status: 404, description: "Income source not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.incomeSourcesService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new income source" })
	@ApiResponse({ status: 201, description: "Returns the created income source", type: IncomeSourceResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateIncomeSourceDto) {
		return this.incomeSourcesService.create(profile.id, dto);
	}

	@Post("bulk")
	@ApiOperation({ summary: "Create multiple income sources (per-item validation, partial success allowed)" })
	@ApiResponse({
		status: 201,
		description: "Returns successful items, failed items with errors, total count, and creationState",
		type: BulkCreateResponseDto,
	})
	async bulkCreate(
		@CurrentUser() profile: Profile,
		@Body() body: { sources?: unknown[] },
	) {
		const sources = Array.isArray(body?.sources) ? body.sources : [];
		return this.incomeSourcesService.bulkCreate(profile.id, sources as Record<string, unknown>[]);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update an income source by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated income source", type: IncomeSourceResponseDto })
	@ApiResponse({ status: 404, description: "Income source not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateIncomeSourceDto,
	) {
		return this.incomeSourcesService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete an income source (deactivate)" })
	@ApiResponse({ status: 200, description: "Income source deactivated" })
	@ApiResponse({ status: 404, description: "Income source not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.incomeSourcesService.remove(id, profile.id);
		return { message: "Income source deactivated" };
	}
}