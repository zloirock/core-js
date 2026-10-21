import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
export function read(flag, user) {
  const [_ref] = [flag ? Array : user];
  const from = _ref === Array ? _Array$from : _ref.from;
  const at = _at(_ref);
  return [from, at];
}