// combined optional chain whose receiver is an IIFE-returned proxy-global behind a TS cast
// (`((() => globalThis)() as any).flat?.().at(0)`). the inner globalThis substitutes to
// `_globalThis` (the IIFE stays a live reference - the cast member does not collapse it) and the
// cast wrapper is preserved verbatim in the memo, matching the single-call receiver resolution
const r = ((() => globalThis)() as any).flat?.().at(0);
r;
