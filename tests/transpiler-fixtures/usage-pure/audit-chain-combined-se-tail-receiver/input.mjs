// combined optional chain whose receiver is a sequence with a proxy-global tail
// (`(0, globalThis).flat?.().at(0)`). the receiver resolves through the shared single-call
// resolver, so the SE-tail proxy-global substitutes to `_globalThis` (the prefix stays ahead
// of it in eval order) instead of surviving raw into every guard slot of the combined emit
const r = (0, globalThis).flat?.().at(0);
r;
