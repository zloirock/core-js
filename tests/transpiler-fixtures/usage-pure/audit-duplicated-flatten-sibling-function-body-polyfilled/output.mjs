import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// A static declarator and a sibling function retain independent polyfill rewrites.
// The sibling function body remains live after the receiver is mirrored.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  {
    y: {
      at: _unused
    }
  } = {
    y: [() => _Map]
  },
  m = _atMaybeArray([() => _Map]);
export const r = [from, m];