import type { Config } from 'jest';

const config: Config = {
    preset:          'ts-jest',
    testEnvironment: 'node',
    roots:            ['<rootDir>/src', '<rootDir>/tests'],
    testMatch:        ['**/*.test.ts', '**/*.spec.ts'],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    collectCoverage: true,
    coverageReporters: ['text', 'html'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.types.ts',
        '!src/server.ts',
        '!src/config/**',
    ],
    coverageThreshold: {
        global: { lines: 80, functions: 80, branches: 75 },
    },
    setupFiles: ['<rootDir>/tests/setup.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/teardown.ts'],
};

export default config;