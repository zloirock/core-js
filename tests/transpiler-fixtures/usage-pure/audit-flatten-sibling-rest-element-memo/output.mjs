import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
const _ref = getArr();
// A flatten-declaration sibling with a rest element: the polyfilled key is excluded via a synthetic
// placeholder and the receiver memoized, so the instance polyfill survives. sidecar layout: unplugin
// keeps source order; babel hoists the receiver memo above earlier declarators (a side-effect reorder)
// and folds the rest into one declaration - semantically identical, unplugin's order is faithful
const from = _Array$from,
  at = _at(_ref),
  {
    at: _unused,
    ...rest
  } = _ref;
from([1]);
console.log(at, rest);