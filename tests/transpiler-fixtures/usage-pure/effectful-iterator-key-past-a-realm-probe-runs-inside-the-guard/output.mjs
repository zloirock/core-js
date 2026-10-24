import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A call off a constructor read past a live `?.` of the realm probe, its iterator key running an effect: the
// guard holds the key's effect with the read, so neither runs where the probe short-circuits.
let n = 0;
null == _globalThis.window ? void 0 : (n++, _getIterator(_Map));
export { n };