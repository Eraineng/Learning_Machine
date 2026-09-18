import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Integration tests are slower and may share ports/files → run files one at a time
    fileParallelism: false,
  },
});
