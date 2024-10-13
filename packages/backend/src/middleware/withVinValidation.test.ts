import { describe, expect, it, vi } from 'vitest';
import withVinValidation from './withVinValidation';
import { Router } from 'itty-router';

describe('withVinValidation Middleware', () => {
	it.each<string>([
		"ZHWGC7AJ3ELA13895",
		"2T2HA31U74C006100",
		"5YJSA1E5XNF479116",
	])("should forward the request if the VIN is valid", async (vin) => {
		const router = Router();
		const request = { method: 'GET', url: `https://mock-url-test.com/${vin}` };
		const handler = vi.fn(({ vin }) => ({ vin }));

		await router.get('/:vin', withVinValidation, handler).fetch(request);

		expect(handler).toHaveBeenCalledWith(expect.objectContaining({ params: { vin } }));
	});

	it("should transform the VIN to uppercase if it's valid", async () => {
		const router = Router();
		const request = { method: 'GET', url: 'https://mock-url-test.com/5yjsa1e5xnf479116' };
		const handler = vi.fn(({ vin }) => ({ vin }));

		await router.get('/:vin', withVinValidation, handler).fetch(request);

		expect(handler).toHaveBeenCalledWith(expect.objectContaining({ params: { vin: '5YJSA1E5XNF479116' } }));
	});

	it.each<string>([
		"not a vin",
		"ZHWGC7AJ3ELA1389",
		"-",
	])("should return a 400 error if the VIN is not 17 characters long", async (vin) => {
		const router = Router();
		const request = { method: 'GET', url: `https://mock-url-test.com/${vin}` };
		const handler = vi.fn(({ vin }) => ({ vin }));

		const response = await router.get('/:vin', withVinValidation, handler).fetch(request);

		expect(response).toMatchObject({ status: 400 });
		expect(handler).not.toHaveBeenCalled();
	});
});
