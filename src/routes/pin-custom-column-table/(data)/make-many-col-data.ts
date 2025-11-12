import { faker } from '@faker-js/faker';

export type Person = {
	id: number;
	firstName: string;
	lastName: string;
	age: number;
	visits: number;
	progress: number;
	status: 'relationship' | 'complicated' | 'single';
	createdAt: Date;
	email: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	country: string;
	zipCode: string;
	company: string;
	jobTitle: string;
	department: string;
	salary: number;
	startDate: Date;
	manager: string;
	notes: string;
};

const range = (len: number) => {
	const arr: number[] = [];
	for (let i = 0; i < len; i++) {
		arr.push(i);
	}
	return arr;
};

const newPerson = (index: number): Person => {
	return {
		id: index + 1,
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		age: faker.number.int(40),
		visits: faker.number.int(1000),
		progress: faker.number.int(100),
		createdAt: faker.date.past(),
		status: faker.helpers.shuffle<Person['status']>(['relationship', 'complicated', 'single'])[0]!,
		email: faker.internet.email(),
		phone: faker.phone.number(),
		address: faker.location.streetAddress(),
		city: faker.location.city(),
		state: faker.location.state(),
		country: faker.location.country(),
		zipCode: faker.location.zipCode(),
		company: faker.company.name(),
		jobTitle: faker.person.jobTitle(),
		department: faker.commerce.department(),
		salary: faker.number.int({ min: 30000, max: 150000 }),
		startDate: faker.date.past({ years: 5 }),
		manager: faker.person.fullName(),
		notes: faker.lorem.sentence()
	};
};

export function makeData(...lens: number[]) {
	const makeDataLevel = (depth = 0): Person[] => {
		const len = lens[depth]!;
		return range(len).map((d): Person => {
			return {
				...newPerson(d)
			};
		});
	};

	return makeDataLevel();
}
