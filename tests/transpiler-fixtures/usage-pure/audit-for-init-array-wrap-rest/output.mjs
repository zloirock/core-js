import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
for (const [_ref] = [Array], _ref2 = _ref, of = _Array$of, {
    of: _unused,
    ...r
  } = _ref2;;) {
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
for (let i = 0, [_ref3] = [Array], _ref4 = _ref3, fromAsync = _Array$fromAsync, {
    fromAsync: _unused2,
    ...more
  } = _ref4; i < 1; i++) {
  fromAsync([i]);
}