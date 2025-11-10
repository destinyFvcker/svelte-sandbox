import type { PageLoad } from './$types.js';

const possibleSubPages = ['simple'];

export const entries = () => {
	return possibleSubPages.map((sub) => {
		return { sub };
	});
};

export const load: PageLoad = ({ params }) => {
	return {
		sub: params.sub
	};
};
