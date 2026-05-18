// TS-wrapped chain receiver: `(globalThis as any).flat?.().includes(1)`. chain emit
// keeps the wrapper verbatim (`_ref = globalThis as any` - mirrors babel's memo shape).
// the inner `globalThis` Identifier visitor must be suppressed so it doesn't queue a
// parallel global-rewrite transform whose needle range (the whole `(globalThis as any)`
// Paren+TS-cast) wouldn't compose into the chain emit's wrapper-verbatim text
(globalThis as any).flat?.().includes(1);
