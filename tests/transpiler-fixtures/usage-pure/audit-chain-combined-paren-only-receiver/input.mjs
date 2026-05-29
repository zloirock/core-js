// Parenthesis-wrapped chain receiver `(globalThis).flat?.().includes(1)` - plain parens,
// no TS cast. The wrapper is peeled so the inner `globalThis` resolves to the global
// polyfill, and the optional chain narrows flat/includes without queuing a duplicate
// globalThis rewrite.
(globalThis).flat?.().includes(1);
