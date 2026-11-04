import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// The middle alias may be null, so the write can replace Promise with a foreign receiver.
// Pure mode must dispatch on the actual receiver.
let a = Array,
  b = pick ? _Map : null,
  c = _Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const unused = a.unrelated;
export const value = (c === _Promise ? _Promise$resolve : c.resolve.bind(c))(1);