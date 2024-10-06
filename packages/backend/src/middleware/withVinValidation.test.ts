import { describe, it } from 'vitest';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('withVinValidation Middleware', () => {
	it.todo("should forward the request if the VIN is valid");

	it.todo("should transform the VIN to uppercase if it's valid");

	it.todo("should return a 400 error if the VIN is not provided");

	it.todo("should return a 400 error if the VIN is not 17 characters long");
});
