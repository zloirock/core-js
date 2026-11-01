import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// An excluded static remains before the served function-name read.
// The raw constructor hop retains its ordered source slots.
const {
    Array: _ref
  } = _globalThis,
  {
    from
  } = _ref,
  name = _nameMaybeFunction(_ref);
use(from, name);
export {};