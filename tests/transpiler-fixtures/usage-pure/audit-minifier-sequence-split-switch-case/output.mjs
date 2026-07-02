import _Array$from from "@core-js/pure/actual/array/from";
// minifier-shape `(0, ({ from } = Array))` inside a SwitchCase consequent. SwitchCase
// uses `consequent` for its statement list (not `body`), so the statement-list walker
// needs a dedicated visitor to reach case-body statements - otherwise the destructure
// emitter never sees the rewritten `{ from } = Array` and the polyfill is dropped
function dispatch(n) {
  let from;
  switch (n) {
    case 1:
      0;
      from = _Array$from;
      break;
    default:
      from = null;
  }
  return from;
}
dispatch(1)([1, 2]);