import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
var _ref2;
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS
// on. the receiver hint here comes from the CALL's return type, which knows nothing of the optional
// link above it: folding there answers `true` where native throws, and erases the receiver's own
// evaluation with it. the parens make no difference - sealing an optional chain keeps the value
// undefined, it only stops the short-circuit from reaching what follows.
// the receiver must be TYPED for the fold to be reachable at all: a untyped host resolves to no
// hint and the row would pass whatever the gate says
const src = [3, [1, 2]];
const words = ['ab', 'cd'];
export function probes(absent) {
  var _ref;
  const arr = absent ? null : src;
  const list = absent ? null : words;
  return [('flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true), ('at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true), ('includes' in (list == null ? void 0 : _concatMaybeArray(list).call(list, [])), true), ('entries' in (arr == null ? void 0 : _sliceMaybeArray(_ref = _sliceMaybeArray(arr).call(arr)).call(_ref)), true)];
}
// the controls that keep the fold alive - nothing can short-circuit, so the operand IS the type its
// hint names and the constant answer is the polyfilled world's answer
export const literalReceiver = true;
export const plainCallReceiver = (_sliceMaybeArray(src).call(src), true);
export const chainedPlainCall = (_sliceMaybeArray(_ref2 = _concatMaybeArray(words).call(words, [])).call(_ref2), true);

// the STATIC host asks the same nullish question: a proxy hop that can short-circuit hands `in` the
// undefined it throws on, so the constant cannot simply replace the test there either. the controls
// below keep the static fold reachable - a bare global host is never nullish
export const staticBehindProxyHop = ('from' in _globalThis.window?.Array, true);
export const staticBehindPlainHop = true;
export const staticBareHost = true;

// a FOLDED branching operand is replayed WHOLE, never piecewise: its effects are conditional, so
// re-emitting one side alone would run it unconditionally. `'flat' in (arr || src.slice())` keeps
// `arr || src.slice()` ahead of the constant - the erased spelling ran neither call
// the logical operators are NOT symmetric for this question. `&&` yields its LEFT whenever that is
// falsy, and every falsy value is one `in` throws on - so it can hand `in` a bad operand even when
// both sides look like arrays. `||` and `??` yield the left only when it is usable, so only their
// right operand can carry a bad value through. an always-truthy object literal on the left of `&&`
// is the one shape that keeps the fold
export function logicalReceivers(absent) {
  const arr = absent ? null : src;
  return [('flat' in (arr && _sliceMaybeArray(src).call(src)), true), (arr || _sliceMaybeArray(src).call(src), true), (arr ?? _sliceMaybeArray(src).call(src), true), ([1] && _sliceMaybeArray(src).call(src), true)];
}

// composition: the fold DISCARDS its operands, replaying only calls and structural effects - so an
// operand carrying an `in` of its own must not be erased, or the inner test's throw goes with it.
// the rows walk the wrap meeting other transforms: a nav inside it, a chained dispatch (whose ref
// memo makes a sibling wrap the arrow body), two wraps in one expression, and a wrap in the TEST
// of another one
export function composedWraps(absent) {
  const arr = absent ? null : src;
  return [('flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr, null == _globalThis.window ? void 0 : _Math$trunc(0.5))), true), (() => {
    var _ref3;
    return 'at' in (arr == null ? void 0 : _concatMaybeArray(_ref3 = _sliceMaybeArray(arr).call(arr)).call(_ref3, [4])), true;
  })(), [('flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true), ('at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true)], ('flat' in (('at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true) ? _sliceMaybeArray(src).call(src) : src), true)];
}

// the fold replays CALLS, and what it may erase is decided scope-aware: only a callee it can
// reach AND prove effect-free folds away. an unreachable callee is UNKNOWN, not pure - a method
// call, an imported function, a tagged template (whose tag no callee resolution reaches) all keep
// their evaluation ahead of the constant
let calls = 0;
function impureMk() {
  calls++;
  return [1];
}
function pureMk() {
  return [1];
}
function tag() {
  return [1];
}
const box = {
  make() {
    calls++;
    return [1];
  }
};
export const viaImpureCall = (impureMk(), true);
export const viaPureCall = true;
export const viaMethodCall = (box.make(), true);
export const viaTaggedTemplate = (tag`x`, true);
export { calls };