import type { IRequestStrict } from "itty-router";

type ApiRequest = {
	params: {
		vin: string;
	};
} & IRequestStrict;
