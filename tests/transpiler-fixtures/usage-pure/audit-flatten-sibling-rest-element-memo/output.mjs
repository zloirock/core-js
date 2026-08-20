import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// A flatten-declaration sibling with a rest element: the polyfilled key is excluded via a synthetic
// placeholder and the receiver memoized, so the instance polyfill survives. both emitters keep the
// receiver memo at the sibling's source slot (after earlier declarators), so the outputs converge and
// there is no sidecar
const from = _Array$from;
const _ref = getArr();
const at = _at(_ref);
const {
  at: _unused,
  ...rest
} = _ref;
from([1]);
console.log(at, rest);