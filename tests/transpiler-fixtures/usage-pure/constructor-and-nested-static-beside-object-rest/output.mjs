import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A direct constructor and nested static are extracted beside object rest.
// Each binding is emitted once; consumed keys still stay excluded from rest.
const Map = _Map;
const from = _Array$from;
const {
  Map: _unused,
  Array: _unused2,
  ...rest
} = _globalThis;
use(Map, from, rest);