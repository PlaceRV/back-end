import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	reporters: [
		'summary',
		['github-actions', { silent: false }],
		['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
	],
	collectCoverage: true,
	json: true,
	coverageReporters: [
		'json-summary',
		['text', { file: 'coverage.txt' }],
	],
};

export default config;
