import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref4, _ref6;
// Locals and generated memos stay inside the retained body, with every inner polyfill applied.
// Conditional realm-or-null returns stay guarded; unrelated local declarations allow proving
// a definite returned realm and injecting the static beyond it.
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
export const noScopedVar = null == (() => _globalThis)()?.window ? void 0 : _endsWithMaybeString(_ref4 = _String$fromCodePoint(99)).call(_ref4, 'c');
export const localBody = null == (() => {
  var _ref5;
  const inner = _flatMaybeArray(_ref5 = [1, [2]]).call(_ref5);
  effectCount += inner.length;
  return _globalThis;
})() ? void 0 : _atMaybeArray(_ref6 = _Array$of(5)).call(_ref6, 0);