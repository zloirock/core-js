import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// An earlier unrelated read must leave the Promise alias as certain as when resolve is read first.
// Pure mode can call the Promise static directly.
let a = Array,
  b = _Map,
  c = _Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const unused = a.unrelated;
export const value = _Promise$resolve(1);