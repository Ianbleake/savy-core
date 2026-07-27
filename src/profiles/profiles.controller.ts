import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import { OnboardingValidationResponseDto, ProfileResponseDto, UpdateProfileDto } from "./dto/profile.dto";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@ApiBearerAuth()
@Controller("profiles")
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@Get("me")
	@ApiOperation({ summary: "Get current user profile" })
	@ApiResponse({
		status: 200,
		description: "Returns complete user profile with computed fields",
		type: ProfileResponseDto,
	})
	async getMyProfile(@CurrentUser() profile: Profile) {
		return this.profilesService.withComputed(profile);
	}

	@Patch("me")
	@ApiOperation({ summary: "Update current user profile" })
	@ApiResponse({
		status: 200,
		description: "Returns updated profile with computed fields",
		type: ProfileResponseDto,
	})
	async updateMyProfile(@CurrentUser() profile: Profile, @Body() dto: UpdateProfileDto) {
		const updated = await this.profilesService.update(profile.id, dto);
		return this.profilesService.withComputed(updated);
	}

	@Get("onboarding/validate")
	@ApiOperation({ summary: "Validate if all required onboarding fields are complete" })
	@ApiResponse({
		status: 200,
		description: "Returns whether onboarding requirements are met and lists any missing fields",
		type: OnboardingValidationResponseDto,
	})
	async validateOnboarding(@CurrentUser() profile: Profile) {
		return this.profilesService.validateOnboarding(profile);
	}

	@Post("onboarding/complete")
	@ApiOperation({ summary: "Mark onboarding as completed after validating required fields" })
	@ApiResponse({
		status: 200,
		description: "Onboarding completed successfully, returns updated profile",
		type: ProfileResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Onboarding requirements not met, returns missing fields",
	})
	async completeOnboarding(@CurrentUser() profile: Profile) {
		const updated = await this.profilesService.completeOnboarding(profile.id);
		return this.profilesService.withComputed(updated);
	}
}
