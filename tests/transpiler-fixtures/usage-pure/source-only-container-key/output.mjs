import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
// A computed key may query a source-only container before its later write.
// The native default reads a static from the substituted constructor.
const arr = [];
const k = String(arr.length);
const {
  [k]: {
    groupBy
  } = _Map
} = {};
_pushMaybeArray(arr).call(arr, groupBy);
export const r = typeof arr[0];