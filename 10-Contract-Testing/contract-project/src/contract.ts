// A minimal contract format + matcher engine, modelled on Pact.
// Real projects use Pact; building it yourself makes the concept click.

export type Matcher =
  | { match: 'type'; value: unknown } // any value of the same TYPE
  | { match: 'regex'; regex: string; value: string }
  | { match: 'eachLike'; value: unknown; min: number }; // array of things shaped like value

export interface Interaction {
  description: string;
  providerState: string; // what data the provider must have for this to work
  request: { method: string; path: string; query?: Record<string, string>; headers?: Record<string, string>; body?: unknown };
  response: { status: number; headers?: Record<string, string>; body?: unknown };
}

export interface Contract {
  consumer: string;
  provider: string;
  interactions: Interaction[];
}

export const like = (value: unknown): Matcher => ({ match: 'type', value });
export const term = (regex: string, value: string): Matcher => ({ match: 'regex', regex, value });
export const eachLike = (value: unknown, min = 1): Matcher => ({ match: 'eachLike', value, min });

const isMatcher = (v: any): v is Matcher => v && typeof v === 'object' && 'match' in v;

/** Concrete example values the mock provider should return. */
export function resolveExample(spec: any): any {
  if (isMatcher(spec)) {
    if (spec.match === 'eachLike') return Array.from({ length: spec.min }, () => resolveExample(spec.value));
    return resolveExample((spec as any).value);
  }
  if (Array.isArray(spec)) return spec.map(resolveExample);
  if (spec && typeof spec === 'object') {
    return Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, resolveExample(v)]));
  }
  return spec;
}

/**
 * Verify an actual provider response against the contract's expectation.
 * Returns a list of human-readable mismatches (empty = contract satisfied).
 * ⭐ Key idea: the consumer only requires the fields it USES, with the right TYPES.
 * The provider may add extra fields freely — that is not a breaking change.
 */
export function verify(expected: any, actual: any, path = 'body'): string[] {
  const errors: string[] = [];

  if (isMatcher(expected)) {
    switch (expected.match) {
      case 'type': {
        const want = typeof resolveExample(expected.value);
        const got = typeof actual;
        if (Array.isArray(expected.value) !== Array.isArray(actual) || want !== got) {
          errors.push(`${path}: expected type ${Array.isArray(expected.value) ? 'array' : want}, got ${Array.isArray(actual) ? 'array' : got}`);
        } else if (want === 'object' && actual !== null) {
          errors.push(...verify(expected.value, actual, path));
        }
        return errors;
      }
      case 'regex': {
        if (typeof actual !== 'string' || !new RegExp(expected.regex).test(actual)) {
          errors.push(`${path}: "${actual}" does not match /${expected.regex}/`);
        }
        return errors;
      }
      case 'eachLike': {
        if (!Array.isArray(actual)) return [`${path}: expected an array, got ${typeof actual}`];
        if (actual.length < expected.min) errors.push(`${path}: expected at least ${expected.min} items, got ${actual.length}`);
        actual.forEach((item, i) => errors.push(...verify(expected.value, item, `${path}[${i}]`)));
        return errors;
      }
    }
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return [`${path}: expected an array`];
    expected.forEach((item, i) => errors.push(...verify(item, actual[i], `${path}[${i}]`)));
    return errors;
  }

  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') return [`${path}: expected an object, got ${typeof actual}`];
    for (const [key, value] of Object.entries(expected)) {
      if (!(key in actual)) {
        errors.push(`${path}.${key}: MISSING from the provider response`);
        continue;
      }
      errors.push(...verify(value, (actual as any)[key], `${path}.${key}`));
    }
    return errors; // extra fields in `actual` are allowed
  }

  if (expected !== actual) errors.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  return errors;
}
