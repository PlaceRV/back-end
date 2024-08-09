/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
	rootDir: '.',
	moduleNameMapper: {
		'src/(.*)': '<rootDir>/src/$1',
		'test/(.*)': '<rootDir>/test/$1',
	},
};
