import { error, type RequestHandler } from "itty-router";

/**
 * Middleware to perform VIN validation on the request
 *
 * If the VIN is invalid, a 400 error response is returned
 * If the VIN is valid, the request is passed through with the VIN transformed to uppercase
 *
 * @todo Implement true VIN validation
 * @param request The Itty request object
 * @returns An error response if the VIN is invalid or passes through if the VIN is valid
 */
const withVinValidation: RequestHandler = (request): Response | undefined => {
	const vin = request?.params?.vin;

	if (!vin || vin.length !== 17) {
		return error(400, 'Invalid VIN provided');
	}

	request.params.vin = vin.toUpperCase();
};

export default withVinValidation;
