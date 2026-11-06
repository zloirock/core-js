// `include: [Infinity]` is reported in the validation error as `Infinity` (not JSON-rendered
// `null`) so the user can distinguish it from a real `[null]` element. Non-finite numbers,
// Symbol, BigInt, and function values are stringified via their native toString before
// falling back to JSON.stringify
foo;
