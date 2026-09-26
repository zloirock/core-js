import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// The iterator slot stays native beside rest. The static sibling retains its polyfill
// and its rest exclusion.
const o = _Array$of;
const [{
  [_Symbol$iterator]: it,
  of: _unused,
  ...r
}] = [Array];
it;
o(1);
r;