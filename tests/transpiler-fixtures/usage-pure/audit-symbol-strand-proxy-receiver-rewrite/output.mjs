import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$toStringTag from "@core-js/pure/actual/symbol/to-string-tag";
// a well-known-symbol read off a proxy-global receiver is NOT an iterator-strand collapse
// (`Symbol.asyncIterator` / `Symbol.toStringTag` carry no get-iterator entry): the receiver must
// fall to the regular proxy-global rewrite instead of being subsumed by the symbol dispatch - a
// subsumed receiver stranded a raw `self` / a raw `.self` hop (off-engine ReferenceError /
// undefined read). a LIVE `Symbol.iterator` entry still collapses the whole read to the
// get-iterator-method helper over the pure root.
const bareSelf = _self[_Symbol$asyncIterator];
const hop = _globalThis[_Symbol$toStringTag];
const live = _getIteratorMethod(_globalThis);
export { bareSelf, hop, live };