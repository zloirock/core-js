// contrast to the paren-terminated cases: an optional hop in the MIDDLE of a chain with no
// terminating parentheses stays one optional chain. The outer `.includes` is a continuation:
// a nullish `flatMap` method short-circuits to undefined, but a nullish call result still throws.
// The polyfilled inner and outer calls must preserve both outcomes, while the
// paren gate stays narrow and does not over-bail on ordinary mid-chain optionals.
const r = arr.flatMap?.(x => x).includes(3);
