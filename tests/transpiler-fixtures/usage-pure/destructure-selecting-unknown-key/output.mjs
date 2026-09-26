import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// An unknown key retains its own read between independently guarded named statics.
export function read(source, key) {
  var _ref2;
  const _ref = source || Array,
    from = _ref === Array ? _Array$from : _ref["from"],
    {
      [key]: other
    } = _ref,
    of = (_ref2 = _ref === Array ? _Array$of : _ref["of"]) === void 0 ? 17 : _ref2;
  return [from, other, of];
}