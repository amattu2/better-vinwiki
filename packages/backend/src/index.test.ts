import { describe, expect, it, vi } from "vitest";
import router from "./index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const env: Env = {};

const ctx: ExecutionContext = {
	waitUntil: (promise: Promise<any>): void => {
		throw new Error("Function not implemented.");
	},
	passThroughOnException: (): void => {
		throw new Error("Function not implemented.");
	}
};

describe("Basic Functionality", () => {
	it("should return a 404 error if the route is not found", async () => {
		const request = new IncomingRequest("https://mock-test-url/this-route-does-not-exist", {
			method: "GET",
		});

		const response = await router.fetch(request, env, ctx);

		expect(response).toMatchObject({ status: 404 });
	});

	it("should return a 405 error if the method is not allowed for the route", async () => {
		const request = new IncomingRequest("https://mock-test-url/this-route-does-not-exist", {
			method: "DELETE",
		});

		const response = await router.fetch(request, env, ctx);

		expect(response).toMatchObject({ status: 405 });
	});
});

describe("Golo365 Route", () => {
	it("should handle a valid request to the route", async () => {
		const request = new IncomingRequest("https://mock-test-url/api/v1/vin/ZARFANBN2R7681933/golo365", {
			method: "GET",
		});

		const response = await router.fetch(request, env, ctx);

		expect(response).toMatchObject({ status: 200 });

		// TODO: Mock handler to avoid actually calling external service
	});

	it("should return a 400 error if the VIN is invalid", async () => {
		const request = new IncomingRequest("https://mock-test-url/api/v1/vin/INVALIDVIN/golo365", {
			method: "GET",
		});

		const response = await router.fetch(request, env, ctx);

		expect(response).toMatchObject({ status: 400 });
	});

	it.each<string>([
		"POST",
		"DELETE",
		"HEAD",
		"PUT",
		"PATCH",
		"OPTIONS",
	])("should return a 405 error if the method is not allowed for the route", async (method) => {
		const request = new IncomingRequest("https://mock-test-url/api/v1/vin/ZARFANBN2R7681933/golo365", {
			method,
		});

		const response = await router.fetch(request, env, ctx);

		expect(response).toMatchObject({ status: 405 });
	});
});
