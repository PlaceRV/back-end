import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	reporters: [
		'summary',
		['github-actions', { silent: false }],
		['jest-junit', { outputDirectory: 'reports', outputName: 'report.xml' }],
	],
	coverageThreshold: { global: { lines: 80 } },
};

export default config;
