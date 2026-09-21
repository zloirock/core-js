import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
for (const [_ref] = [Array], _ref2 = _ref, of = null == _ref2 ? _ref2[""] : _Array$of, {
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
for (let i = 0, [{
    isArray,
    ...more
  }] = [Array]; i < 1; i++) {
  isArray([i]);
}