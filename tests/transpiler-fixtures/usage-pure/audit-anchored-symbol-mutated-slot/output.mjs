import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a SLOT-mutated ctor (user shim installed on the proxy) keeps the anchored symbol
// extraction on the RAW member read - the shim's own iterator method must win over the
// pure constructor binding
_globalThis.Map = Shim;
const x = _getIteratorMethod(_globalThis.Map);
x;