import '@testing-library/jest-dom';

// Mock Electron IPC
global.window = global.window || {};
(global.window as any).electron = {
  invoke: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
};
