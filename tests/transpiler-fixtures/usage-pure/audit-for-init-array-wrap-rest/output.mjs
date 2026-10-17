import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
for (const [,] = [Array], of = _Array$of, {
    of: _unused,
    ...r
  } = Array;;) {
  of(1);
  break;
}
for (const [{
  from
}, extra] = [{
  from: _Array$from
}, 1];;) {
  from([2, extra]);
  break;
}
// a multi-declarator header takes the sibling polyfill mid-list
for (let i = 0, [,] = [Array], fromAsync = _Array$fromAsync, {
    fromAsync: _unused2,
    ...more
  } = Array; i < 1; i++) {
  fromAsync([i]);
}