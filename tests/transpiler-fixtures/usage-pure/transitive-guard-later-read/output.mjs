import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// The Promise static is read before an unrelated lookup in the same guard cycle.
// Pure mode can call the Promise static directly.
let a = Array,
  b = _Map,
  c = _Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const value = _Promise$resolve(1);
export const unused = a.unrelated;