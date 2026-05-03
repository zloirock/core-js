// fallback path receiver leaf reached through SequenceExpression: `(0, Promise)?.foo`.
// receiver is a SequenceExpression whose tail is the polyfillable Identifier. Pass 18's
// unwrapReceiverLeaf peels parens / SE / chain / TS / IIFE so the leaf Identifier gets
// added to skippedNodes - otherwise the parallel `Promise -> _Promise` substitution
// composed by the inner Identifier visitor would compose into the outer fallback's
// emit (substring `Promise` inside `_Promise` -> `__Promise` corruption).
// minimal repro: lock the receiver-leaf-via-SE skip behavior alongside the existing
// IIFE / paren-wrapped variants
const probe = (0, Promise)?.foo;
probe;
