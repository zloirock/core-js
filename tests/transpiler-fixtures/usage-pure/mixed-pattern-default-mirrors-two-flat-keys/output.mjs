import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise";
import _WeakMap from "@core-js/pure/actual/weak-map";
export const twoFlatKeys = (({
  WeakMap,
  Promise: P2,
  Array: {
    from: from2
  }
} = {
  WeakMap: _WeakMap,
  Promise: _Promise,
  Array: {
    from: _Array$from
  }
}) => [WeakMap, P2, from2])();