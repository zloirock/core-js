import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// One source evaluation supplies every extraction and the retained residual.
// Bodyless and discarded-sequence hosts preserve the surrounding effects.
export function read(holder, before, after) {
  var _ref2;
  let at, includes, length;
  const _ref = (before(), holder.rows);
  at = _at(_ref);
  includes = _includes(_ref);
  if (holder) _ref2 = holder.rows, at = _at(_ref2), {
    length
  } = _ref2;
  before();
  const _ref3 = holder.rows;
  at = _at(_ref3);
  includes = _includes(_ref3);
  after();
  return [at, includes, length];
}