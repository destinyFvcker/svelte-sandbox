import type { PageLoad } from './$types.js';

const possibleSubPages = [
	'simple',
	'test-duration1',
	'official-example',
	'test-duration2',
	'test-duration3',
	'single-dimension-bar'
];

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
