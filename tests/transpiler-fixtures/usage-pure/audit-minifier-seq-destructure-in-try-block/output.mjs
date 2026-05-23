import _Array$from from "@core-js/pure/actual/array/from";
// minifier-shape inside a TryStatement.block BlockStatement. exercises the descendant-block
// walk via a non-function host. uses `.from` (polyfilled in IE11 target) so the emitted
// `_Array$from` import is observable evidence that the destructure-emitter ran end-to-end
let from;
try {
  sideEffect();
  from = _Array$from;
} catch (e) {
  /* noop */
}
from([1, 2, 3]);