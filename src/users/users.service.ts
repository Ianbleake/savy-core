import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { User } from "../../generated/prisma/client.js";

interface CreateUserData {
	supabaseId: string;
	email: string;
	name: string | null;
}

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async findBySupabaseId(supabaseId: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { supabaseId },
		});
	}

	async findById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id },
		});
	}

	async create(data: CreateUserData): Promise<User> {
		return this.prisma.user.create({
			data: {
				supabaseId: data.supabaseId,
				email: data.email,
				name: data.name,
			},
		});
	}
}
