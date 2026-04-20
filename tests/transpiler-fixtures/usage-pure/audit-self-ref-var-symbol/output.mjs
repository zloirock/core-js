import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `var Symbol = Symbol` — parallel to Map case but with a known-global that also flows
// through the Symbol.X optimizer (handleBinaryIn for `Symbol.iterator in obj`). Confirms
// the self-ref guard catches known-globals other than Map / Set / Promise
var Symbol = _Symbol;
_Symbol$iterator in obj;