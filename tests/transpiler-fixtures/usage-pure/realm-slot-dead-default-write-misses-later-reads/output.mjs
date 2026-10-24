import _Array$from from "@core-js/pure/actual/array/from";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Map from "@core-js/pure/actual/map";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _URLSearchParams from "@core-js/pure/actual/url-search-params/constructor";
var _ref;
// A default on a slot the realm always fills never runs. Pure drops a realm key's default with the rewrite - on
// a leaf with the extraction, on a level with the level's mirror - so a write in it reaches no later read; a
// static's default inside a level it keeps as written, where its write still counts. A parameter's realm default
// stands in for a caller's object, which may lack the slot: the default there runs.
let a = 'ab',
  b = 'cd',
  c = 'ef',
  d = 'gh';
const M = _Map;
const {
  Promise: {
    allSettled
  }
} = {
  Promise: {
    allSettled: _Promise$allSettled
  }
};
const {
  Array: {
    from = (c = [3], 0)
  }
} = {
  Array: {
    from: _Array$from
  }
};
export function parameter({
  Reflect: {
    ownKeys
  } = (d = [4], _URLSearchParams)
} = {
  Reflect: {
    ownKeys: _Reflect$ownKeys
  }
}) {
  return ownKeys;
}
parameter({});
export const reads = [a.flat(), b.findLast(Boolean), _toReversedMaybeArray(c).call(c), _withMaybeArray(_ref = d).call(_ref, 0, 1)];
export { M, allSettled, from };