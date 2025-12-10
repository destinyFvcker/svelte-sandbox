import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types.js';

const possibleSubPages = ['40', '404'];

export const entries = () => {
	return possibleSubPages.map((sub) => {
		return { sub };
	});
};

export const load: PageLoad = ({ params }) => {
	if (!possibleSubPages.includes(params.sub)) {
		goto(resolve('/error/404'));
		return;
	}

	return {
		sub: params.sub
	};
};
