import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A bodyless loop keeps its original statement after each activation's ordered default reads.
const events = [];
const results = [];
for (const _ref3 of [[], []]) {
  let _ref2 = false;
  const [_ref = (_ref2 = true, _globalThis)] = _ref3,
    {} = _ref,
    {
      Array: _ref4
    } = _ref2 ? {
      "Array": _globalThis.Array
    } : _ref,
    {} = _ref4,
    {
      of
    } = _ref2 ? {
      of: _Array$of
    } : _ref4,
    {
      [(_pushMaybeArray(events).call(events, 'key'), 'with-dash')]: dash
    } = _ref,
    {
      sibling: first
    } = _ref,
    {
      sibling: second
    } = _ref;
  _pushMaybeArray(results).call(results, [of(3), dash, first, second]);
}
use(results, events);