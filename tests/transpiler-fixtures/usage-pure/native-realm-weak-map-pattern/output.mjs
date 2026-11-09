import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// The extracted prototype method and constructed receiver use the same pure constructor.
const {
  prototype: {
    has
  }
} = _WeakMap;
const key = {};
export const r = has.call(new _WeakMap([[key, 1]]), key);