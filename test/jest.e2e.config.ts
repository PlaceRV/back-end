import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	rootDir: '..',
	testRegex: '.spec.e2e.ts$',
	moduleDirectories: ['node_modules', 'src'],
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
};

export default config;
