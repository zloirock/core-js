// NUMBER_LITERAL_RE accepts a leading minus, decimal fractions, and exponents but rejects
// hex / octal / BigInt suffix. Probe edge segments after the literal 'v_' prefix:
//   v_-1   - leading '-' allowed -> match,  Tag keeps key, value number[] -> array narrowing
//   v_3.14 - decimal fraction allowed -> match, Tag keeps key, value string[] -> array narrowing
//   v_0x10 - hex literal not in the simple regex -> drop, key absent from Tag -> generic emit
//   v_42n  - BigInt literal suffix not allowed -> drop, key absent from Tag -> generic emit
// matched keys emit array-narrowed `_atMaybeArray` / `_includesMaybeArray`; dropped keys
// fall back to generic `_at` / `_includes` because the resolver can't find them in the
// post-rename Tag shape. distinct methods per line make the contrast observable
type Tag<T> = { [K in keyof T as K extends `v_${ number }` ? K : never]: T[K] };
declare const r: Tag<{ 'v_-1': number[]; 'v_3.14': string[]; 'v_0x10': boolean; 'v_42n': symbol }>;
r['v_-1'].at(0);
r['v_3.14'].includes('a');
r['v_0x10'].at(1);
r['v_42n'].includes(0);
