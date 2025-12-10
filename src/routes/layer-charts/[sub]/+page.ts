import type { PageLoad } from './$types.js';

const possibleSubPages = ['simple', 'test-duration', 'official-example'];

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
