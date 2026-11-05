import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$values from "@core-js/pure/actual/object/values";
// Parentheses preserve the array-wrapper boundary and its native static/rest reads.
// The flat realm twin extracts values while retaining the same rest exclusions.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const [{
  Object: {
    keys,
    ...restA
  }
}] = ([_globalThis]);
const values = _Object$values;
const {
  Object: {
    values: _unused,
    ...restB
  }
} = _globalThis;
const [{
  Object: {
    entries,
    ...restC
  }
}] = ([(eff('a'), _globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };