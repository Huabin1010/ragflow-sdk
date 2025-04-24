module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/types/**/*.ts'
  ],
  coverageReporters: [
    'text',
    'lcov'
  ],
  moduleFileExtensions: [
    'ts', 
    'js', 
    'json'
  ]
}; 