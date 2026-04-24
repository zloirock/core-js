import _Array$from from "@core-js/pure/actual/array/from";
import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map/constructor";
// destructure init is a logical expression - for `??` / `||` the primary operand
// is the left side (fallback right); for `&&` the primary is the right side
// (left is only the gate). Polyfills resolve against the primary operand
const from = _Array$from;
const keys = _keys(Stub ?? Object);
const {
  entries
} = Array && _Map;