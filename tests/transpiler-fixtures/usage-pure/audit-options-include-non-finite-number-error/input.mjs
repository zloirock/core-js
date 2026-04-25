// `include: [Infinity]` reports the value as `Infinity` (not JSON-rendered `null`) so users
// can distinguish from a real `[null]` element. `safeStringify` handles non-finite numbers /
// Symbol / BigInt / function via native toString before falling back to JSON.stringify
foo;
