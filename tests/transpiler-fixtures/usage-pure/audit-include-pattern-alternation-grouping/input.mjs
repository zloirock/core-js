// `include: ['es.array.from|es.string.repeat']` - user alternation pattern. without
// `(?:...)` non-capturing group around the user input, regex parsed as `(^es.array.from)|
// (es.string.repeat$)` and matched starts-with / ends-with substrings (over-broad).
// post-fix: matches whole `es.array.from` OR whole `es.string.repeat` ONLY - both whole
// entries trigger emission, validator accepts the user pattern as describing real entries
export const a = Array.from([1, 2, 3]);
export const s = 'hi'.repeat(3);
