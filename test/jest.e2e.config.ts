import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	rootDir: '..',
	testRegex: '^([\w]+)(.e2e.spec.ts)$',
	moduleDirectories: ['node_modules', 'src'],
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
};

export default config;
