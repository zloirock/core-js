import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const f = _Array$from;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const [{
  'from': _unused,
  [_Symbol$iterator]: it,
  ...r
}] = [Array];
f([1]);
it;
r;