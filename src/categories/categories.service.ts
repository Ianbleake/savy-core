import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Category, CategoryType } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@Injectable()
export class CategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllByProfile(
		profileId: string,
		filters?: {
			type?: CategoryType;
			sortBy?: "name" | "createdAt";
			order?: "asc" | "desc";
		},
	): Promise<Category[]> {
		const sortBy = filters?.sortBy ?? "createdAt";
		const order = filters?.order ?? "desc";
		return this.prisma.category.findMany({
			where: { profileId, ...(filters?.type ? { type: filters.type } : {}) },
			orderBy: { [sortBy]: order },
		});
	}

	async findOne(id: string, profileId: string): Promise<Category> {
		const category = await this.prisma.category.findFirst({
			where: { id, profileId },
		});
		if (!category) {
			throw new NotFoundException("Category not found");
		}
		return category;
	}

	async create(profileId: string, dto: CreateCategoryDto): Promise<Category> {
		try {
			return await this.prisma.category.create({
				data: {
					profileId,
					name: dto.name,
					type: dto.type,
					color: dto.color,
					icon: dto.icon,
				},
			});
		} catch (error) {
			if (this.isUniqueConstraintError(error)) {
				throw new ConflictException(`Category "${dto.name}" with type ${dto.type} already exists`);
			}
			throw error;
		}
	}

	async update(id: string, profileId: string, dto: UpdateCategoryDto): Promise<Category> {
		await this.findOne(id, profileId);

		try {
			return await this.prisma.category.update({
				where: { id },
				data: dto,
			});
		} catch (error) {
			if (this.isUniqueConstraintError(error)) {
				throw new ConflictException(`Category "${dto.name}" already exists for this type`);
			}
			throw error;
		}
	}

	async remove(id: string, profileId: string): Promise<void> {
		await this.findOne(id, profileId);
		await this.prisma.category.delete({
			where: { id },
		});
	}

	private isUniqueConstraintError(error: unknown): boolean {
		return (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			(error as { code: string }).code === "P2002"
		);
	}
}
