import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The static reads and the computed key remain in order, including a dynamic native sibling.
export function read(effect, key) {
  const {
      Array: _ref
    } = _globalThis,
    {} = _ref,
    from = (_ref.from, _Array$from),
    of = (effect(), _ref.of, _Array$of),
    {
      [key]: value
    } = _ref;
  return [from, of, value];
}