import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
export const nonIdentifierKey = (({
  WeakSet,
  "with-dash": dashed,
  Array: {
    isArray
  }
} = {
  WeakSet: _WeakSet,
  get "with-dash"() {
    return _globalThis["with-dash"];
  },
  Array: _globalThis.Array
}) => [WeakSet, dashed, isArray])();