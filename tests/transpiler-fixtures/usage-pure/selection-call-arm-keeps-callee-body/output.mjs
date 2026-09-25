import _globalThis from "@core-js/pure/actual/global-this";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A selection arm that CALLS a named function reads what that function returns to every caller, so no
// mirror is written into its body: the call still runs, and the realm it returns is mirrored beside
// it. An inline IIFE returning a static alias is always truthy: the fallback beside it is dead, and
// so is the mirror it would owe - the read takes the identity guard the container itself would.
function realm() {
  return _globalThis;
}
const {
  Math: {
    trunc: viaNamed
  }
} = (realm(), {
  Math: {
    trunc: _Math$trunc
  }
}) || _globalThis;
const other = _Math$sign(-1);
const box = {
  Math
};
const {
    Math: _ref
  } = (() => box)() || _globalThis,
  viaIife = _ref === Math ? _Math$cbrt : _ref.cbrt;
export { viaNamed, other, viaIife };