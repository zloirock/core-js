import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref4, _ref5;
// a scoped `var _refN;` lands inside a block whose enclosing render re-emits that block. splicing it
// into the owner's own content keeps every substitution that render made, where a raw source re-emit
// would put the pre-substitution spelling back: the body's own polyfilled call must still read its
// memo, and the root must stay substituted inside the guard's copy.
// the chain TAIL is deliberately a member core-js does not ponyfill on this target - a block body
// leaves the chain's value unproven today, so a ponyfillable tail would be read raw and this
// baseline would pin that miss as the answer. the miss is recorded in the queue with its repro.
// one instance method per body, so a body that stops resolving shows up in the import set.
export const branchedBody = (() => {
  if (_globalThis) {
    var _ref;
    const inner = _padStartMaybeString(_ref = 'ab').call(_ref, 3, '-');
    return inner.length ? _globalThis : null;
  }
  return null;
})()?.window?.JSON.parse('1');
let effectCount = 0;
export const effectfulBody = (() => {
  var _ref2;
  effectCount++;
  const inner = _includesMaybeArray(_ref2 = [1]).call(_ref2, 1);
  return inner ? _globalThis : null;
})()?.window?.Math.max(1, 2);
export const nestedBodies = (() => {
  var _ref3;
  const outer = _flatMaybeArray(_ref3 = [1, [2]]).call(_ref3);
  return outer.length ? _globalThis : null;
})()?.window?.JSON.stringify({
  a: 1
});

// NEGATIVE: no memo is needed in the body, so no scoped var is inserted and neither path runs
export const noScopedVar = null == (_ref4 = (() => _globalThis)()?.window) ? void 0 : _endsWithMaybeString(_ref5 = _String$fromCodePoint(99)).call(_ref5, 'c');