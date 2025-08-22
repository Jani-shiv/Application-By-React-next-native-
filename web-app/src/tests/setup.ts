import '@testing-library/jest-dom'

// Setup file for tests
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}
