import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
var _ref;
// the in-fold / symbol-in rewrite DISCARDS the LHS whole (`(globalThis, 'from') in Array` -> `true`;
// `(globalThis, Symbol.iterator) in obj` -> `_isIterable(obj)`): a proxy-global buried in the discarded
// LHS (here a side-effect-free sequence prefix) must be marked skipped, else the text emitter queues a
// `globalThis -> _globalThis` rewrite with no target in the replacement -> compose crash (babel drops the
// subtree by replacing the node). the RHS survives - the fold harvests only its SE, the symbol re-emits
// it verbatim. a POLYFILLABLE side effect in the discarded LHS is rescued (re-emitted with its own
// polyfill, NOT skipped); a buried sequence below a forwarder member is reached and dropped too. covers
// fold key / Symbol.iterator call-shape / a non-iterator symbol in-shape / rescued-SE / buried-SE forwarder
let eff = () => 0;
const obj = {};
export const a = true;
export const b = _isIterable(obj);
export const c = _Symbol$asyncIterator in obj;
export const d = (_atMaybeArray(_ref = [1]).call(_ref, 0), true);
export const e = (eff(), _isIterable(obj));