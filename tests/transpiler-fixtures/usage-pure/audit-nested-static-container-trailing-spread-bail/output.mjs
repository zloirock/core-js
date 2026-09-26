import _Array$from from "@core-js/pure/actual/array/from";
// A trailing spread can replace the Array slot of a nested object-literal container.
// Read each receiver once and select the polyfill only when the slot still holds Array.
// A spread-supplied replacement keeps its own from property.
declare const o: Record<string, any>;
const {
    root: {
      Array: _ref
    }
  } = {
    root: {
      Array,
      ...o
    }
  },
  from = _ref === Array ? _Array$from : _ref.from;
from([1]);