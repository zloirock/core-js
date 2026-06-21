import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a lone-prop destructure whose init is RETAINED only for its side effect - the value is consumed by
// the polyfilled binding, no surviving sibling or rest reads it. the proxy-global member chain in that
// retained init must still collapse its intermediate hop (`globalThis.self.Array` -> `_globalThis.Array`)
// so the lifted statement does not read an undefined `.self` hop off-browser (ie:11 / Node). the
// collapse must NOT be gated on value-consumption. distinct methods so each line's import is unambiguous
let firstReads = 0;
let secondReads = 0;
let thirdReads = 0;
(firstReads++, _globalThis.Array) || _Set;
const arrayFrom = _Array$from;
(secondReads++, _globalThis.Array) || _Map;
const arrayOf = _Array$of; // no `||` fallback: the receiver TAIL is pure and unread, so the lift drops it to a bare side-effect
// statement (`thirdReads++`). the proxy hop must NOT be collapsed here - the chain is already gone, and
// editing the dropped region would race the drop (a compose crash). exercises the surviving-tail gate
thirdReads++;
const arrayFromAsync = _Array$fromAsync;
export { arrayFrom, arrayOf, arrayFromAsync };