// `var Symbol = Symbol` — parallel to Map case but with a known-global that also flows
// through the Symbol.X optimizer (handleBinaryIn for `Symbol.iterator in obj`). Confirms
// the self-ref guard catches known-globals other than Map / Set / Promise
var Symbol = Symbol;
Symbol.iterator in obj;
