import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _unused;
// Exclusions already served by extraction are claimed on the inserted properties.
// The native rest target and its independent computed-key read remain visitable.
let from;
const holder = {};
({
  Array: _ref
} = _globalThis);
from = _Array$from, {
  from: _unused,
  ...holder[_atMaybeString("rest").call("rest", -1)]
} = _ref;
export { from, holder };