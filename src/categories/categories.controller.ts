import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import { CategoriesService } from "./categories.service";
import {
	CategoryResponseDto,
	CreateCategoryDto,
	QueryCategoriesDto,
	UpdateCategoryDto,
} from "./dto/category.dto";

@ApiTags("categories")
@ApiBearerAuth()
@Controller("categories")
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Get()
	@ApiOperation({ summary: "List all categories for the current user with optional filters" })
	@ApiResponse({
		status: 200,
		description: "Returns array of categories",
		type: [CategoryResponseDto],
	})
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryCategoriesDto) {
		return this.categoriesService.findAllByProfile(profile.id, {
			type: query.type,
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single category by ID" })
	@ApiResponse({ status: 200, description: "Returns the category", type: CategoryResponseDto })
	@ApiResponse({ status: 404, description: "Category not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.categoriesService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new category" })
	@ApiResponse({
		status: 201,
		description: "Returns the created category",
		type: CategoryResponseDto,
	})
	@ApiResponse({ status: 409, description: "Category with same name and type already exists" })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateCategoryDto) {
		return this.categoriesService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a category by ID (type is immutable)" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated category",
		type: CategoryResponseDto,
	})
	@ApiResponse({ status: 404, description: "Category not found" })
	@ApiResponse({ status: 409, description: "Category name already exists for this type" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateCategoryDto,
	) {
		return this.categoriesService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({
		summary: "Delete a category (transactions keep their data, categoryId becomes null)",
	})
	@ApiResponse({ status: 200, description: "Category deleted" })
	@ApiResponse({ status: 404, description: "Category not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.categoriesService.remove(id, profile.id);
		return { message: "Category deleted" };
	}
}
