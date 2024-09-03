import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	testRegex: '^([w]+)(.spec.ts)$',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
};

export default config;
