import { IttyRouter, IttyRouterType, error, withParams } from 'itty-router'
import withVinValidation from './middleware/withVinValidation';

/**
 * Base API router for the application
 */
const router: IttyRouterType = IttyRouter({
	404: () => error(404, 'Not found'),
	500: () => error(500, 'Internal server error'),
});

router
	.get('/api/v1/vin/:vin/golo365', withParams, withVinValidation, ({ vin }) => ({ message: `${vin}`}))
	.get('*', () => error(404, 'Not found'))
	.all('*', () => error(405, 'Method not allowed'));

export default router;
