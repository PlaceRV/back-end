import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	detectOpenHandles: true,
	moduleDirectories: ['node_modules', 'src'],
	transform: { '^.+.tsx?$': ['ts-jest', {}] },
	reporters: ['summary', ['github-actions', { silent: false }]],
	collectCoverage: true,
	coverageReporters: ['json'],
	testLocationInResults: true,
	json: true,
	ci: true,
};

export default config;
