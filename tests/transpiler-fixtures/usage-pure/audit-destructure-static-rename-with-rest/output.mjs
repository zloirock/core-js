import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const _ref = Array,
  customFrom = null == _ref ? _ref[""] : _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
const xs = customFrom('hi');
_atMaybeArray(xs).call(xs, 0);
_findLastIndexMaybeArray(xs).call(xs, p => p);
_flatMaybeArray(xs).call(xs);