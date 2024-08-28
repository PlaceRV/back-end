import { GraphQLScalarType } from 'graphql';

function validate(uuid: unknown): number[] {
	if (typeof uuid !== 'object') {
		throw new Error('invalid uuid');
	}
	return uuid as number[];
}

export const CustomPointScalar = new GraphQLScalarType({
	name: 'Point',
	description: 'A simple UUID parser',
	serialize: (value) => validate(value),
	parseValue: (value) => validate(value),
	parseLiteral: (ast) => validate(ast),
});
