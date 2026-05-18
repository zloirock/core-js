// Paren-only wrapped chain receiver: `(globalThis).flat?.().includes(1)` - no TS, just
// parenthesization. `markWrappedProxyGlobalSkipped` peels both Paren and TS wrappers via
// the same loop, so the inner `globalThis` Identifier is suppressed and the chain emit
// uses the receiver text verbatim
(globalThis).flat?.().includes(1);
