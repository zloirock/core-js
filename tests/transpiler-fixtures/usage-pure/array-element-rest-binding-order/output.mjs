import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// The instance getter reads before the following rest binding is initialized.
// The source receiver and later declarator each evaluate once in their own position.
export function read(make) {
  const _ref = make(() => rest);
  const at = _at(_ref),
    [{}, ...rest] = [_ref, 2, 3],
    after = 4;
  return [at, rest, after];
}
export function readInterleaved(make) {
  const [_ref2, _ref3, ..._ref4] = [2, make(() => [before, rest]), 3];
  const before = _ref2;
  const includes = _includes(_ref3);
  const rest = _ref4;
  return [before, includes, rest];
}