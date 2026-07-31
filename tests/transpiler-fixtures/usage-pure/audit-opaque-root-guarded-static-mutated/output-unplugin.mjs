import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// a MUTATED static must never collapse onto the ponyfill through the opaque-root guard path:
// the runtime surface carries the user's patch, so the guarded branch keeps reading off the
// memoized ref (patch-wins). separate file - the mutation deopts its pair file-wide
_globalThis.Array.of = function patched() { return ['p']; };
const f = () => _globalThis;
export const patchedCallKeepsRef = null == (_ref = f()?.window) ? void 0 : _at(_ref2 = _ref.Array.of(5)).call(_ref2, 0);
_globalThis.Number.MAX_SAFE_INTEGER = 5;
const g = () => _globalThis;
export const patchedFieldKeepsRef = null == (_ref3 = g()?.window) ? void 0 : _toFixedMaybeNumber(_ref4 = _ref3.Number.MAX_SAFE_INTEGER).call(_ref4, 0);

// a MUTATED proxy-global slot hop (`globalThis.self`) is no longer pristine: the chain keeps
// the raw guarded read (patch-wins), no ponyfill collapse
_globalThis.self = { window: { Array: { of: x => [x, 'fake'] } } };
const m = () => _globalThis;
export const mutatedHopKeepsRef = null == (_ref5 = m()?.self?.window) ? void 0 : _at(_ref6 = _ref5.Array.of(4)).call(_ref6, 0);

// a MUTATED slot hop under an IDENTITY-IIFE root keeps the raw guarded read (patch-wins) -
// the identity proof does not bypass the pristine gate
export const identityMutatedHopKeepsRef = null == (_ref7 = ((x) => x)(_globalThis)?.self?.window) ? void 0 : _at(_ref8 = _ref7.Array.of(6)).call(_ref8, 0);

// a MUTATED slot in the REMAINDER of a proxy nav forbids the leading-hop drop: past the
// user-replaced hop the value is the user's object, so the chain keeps its raw spelling and
// the live `?.` short-circuit (patch-wins)
_globalThis.self = { window: { Array: { of: x => [x, 'fake'] } } };
export const mutatedRemainderKeepsNav = null == (_ref9 = _globalThis.window?.self.window) ? void 0 : _at(_ref10 = _ref9.Array.of(7)).call(_ref10, 0);