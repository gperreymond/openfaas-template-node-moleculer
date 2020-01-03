// jest.config.js
module.exports = {
  automock: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'lcov'],
  collectCoverageFrom: ['modules/*.js'],
  coveragePathIgnorePatterns: ['node_modules']
}
