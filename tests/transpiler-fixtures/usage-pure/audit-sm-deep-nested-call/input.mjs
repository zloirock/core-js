// source map mapping for deeply nested call expressions: each rewrite site must keep
// its source span reachable from the source map.
const result = Array.from(new Set([1,2,3])).at(-1);
