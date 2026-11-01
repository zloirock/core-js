import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// The served function-name read precedes the excluded static.
// Reversing source siblings reverses their runtime reads as well.
const {
    Array: _ref
  } = _globalThis,
  name = _nameMaybeFunction(_ref),
  {
    from
  } = _ref;
use(from, name);
export {};