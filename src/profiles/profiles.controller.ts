import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import type { UpdateProfileDto } from "./dto/profile.dto";
import type { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@ApiBearerAuth()
@Controller("profiles")
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@Get("me")
	@ApiOperation({ summary: "Get current user profile" })
	@ApiResponse({ status: 200, description: "Returns complete user profile with computed fields" })
	async getMyProfile(@CurrentUser() profile: Profile) {
		return this.profilesService.withComputed(profile);
	}

	@Patch("me")
	@ApiOperation({ summary: "Update current user profile" })
	@ApiResponse({ status: 200, description: "Returns updated profile with computed fields" })
	async updateMyProfile(@CurrentUser() profile: Profile, @Body() dto: UpdateProfileDto) {
		const updated = await this.profilesService.update(profile.id, dto);
		return this.profilesService.withComputed(updated);
	}
}
