// minifier-shape inside a TryStatement.block BlockStatement. exercises the descendant-block
// walk via a non-function host. uses `.from` (polyfilled in IE11 target) so the emitted
// `_Array$from` import is observable evidence that the destructure-emitter ran end-to-end
let from;
try {
  (sideEffect(), ({ from } = Array));
} catch (e) {
  /* noop */
}
from([1, 2, 3]);
