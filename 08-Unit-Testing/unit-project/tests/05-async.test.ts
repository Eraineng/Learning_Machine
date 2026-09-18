// Lesson 3 — testing async code
import { describe, it, expect, vi } from 'vitest';
import { getUserName, retry, type Fetcher } from '../src/userService';

describe('getUserName', () => {
  it('returns the full name', async () => {
    const fakeFetch: Fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ firstName: 'Ann', lastName: 'Tester' }),
    });

    await expect(getUserName(1, fakeFetch)).resolves.toBe('Ann Tester');
    expect(fakeFetch).toHaveBeenCalledWith('https://api.example.com/users/1');
  });

  it('throws when the user does not exist', async () => {
    const fakeFetch: Fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });

    await expect(getUserName(99, fakeFetch)).rejects.toThrow('User 99 not found');
  });
});

describe('retry', () => {
  it('succeeds after two failures', async () => {
    const flaky = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('ok');

    await expect(retry(flaky, 3)).resolves.toBe('ok');
    expect(flaky).toHaveBeenCalledTimes(3);
  });

  it('gives up after N attempts and throws the last error', async () => {
    const alwaysFails = vi.fn().mockRejectedValue(new Error('down'));

    await expect(retry(alwaysFails, 2)).rejects.toThrow('down');
    expect(alwaysFails).toHaveBeenCalledTimes(2);
  });
});

// ⚠️ Common mistake: forgetting await / return on async assertions.
// This test would PASS even though the promise rejects, because nothing waits for it:
//   it('broken', () => { expect(Promise.reject(new Error('x'))).resolves.toBe(1); });
