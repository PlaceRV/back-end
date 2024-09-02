/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
};
