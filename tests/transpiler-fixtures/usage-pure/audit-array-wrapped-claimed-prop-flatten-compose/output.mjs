import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const [{
  'from': f,
  [_Symbol$iterator]: it,
  ...r
}] = [Array];
f([1]);
it;
r;