import { error, json } from 'itty-router';
import router from './router';

export default {
	fetch: (request, ...args) =>
		router
			.fetch(request, ...args)
			.then(json)
			.catch(error),
} satisfies ExportedHandler<Env>;
