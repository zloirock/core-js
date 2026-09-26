import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// All receiver getters run before the first extracted property read.
export function read(holder) {
  const [_ref, _ref2] = [holder.first, holder.second];
  const at = _at(_ref);
  const includes = _includes(_ref2);
  return [at, includes];
}