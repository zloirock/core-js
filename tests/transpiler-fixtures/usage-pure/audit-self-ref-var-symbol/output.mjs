import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `var Symbol = Symbol` - self-referential var binding resolves to the global.
// Works for `Symbol` too, not only `Map`/`Set`/`Promise`. `Symbol.iterator in obj`
// still receives its specialized polyfill.
var Symbol = _Symbol;
_Symbol$iterator in obj;