import { Test, type TestingModule } from "@nestjs/testing";
import type { Profile } from "../generated/prisma/client";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

describe("DashboardController", () => {
	let controller: DashboardController;
	let service: { getSummary: jest.Mock };

	beforeEach(async () => {
		service = { getSummary: jest.fn().mockResolvedValue({ generatedAt: "x" }) };
		const module: TestingModule = await Test.createTestingModule({
			controllers: [DashboardController],
			providers: [{ provide: DashboardService, useValue: service }],
		}).compile();
		controller = module.get(DashboardController);
	});

	it("delegates to DashboardService with the profile", async () => {
		const profile = { id: "profile-1", currency: "MXN" } as Profile;
		await controller.getSummary(profile);
		expect(service.getSummary).toHaveBeenCalledWith(profile);
	});

	it("returns the service result unchanged", async () => {
		const profile = { id: "profile-1", currency: "MXN" } as Profile;
		const result = await controller.getSummary(profile);
		expect(result).toEqual({ generatedAt: "x" });
	});
});
