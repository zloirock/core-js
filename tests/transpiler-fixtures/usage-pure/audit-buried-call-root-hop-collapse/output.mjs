import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// the buried root is a proxy NAVIGATION rather than a bare global (`() => globalThis.self`): the render
// that owns the kept call owes it the same hop collapse the natural member rewrite performs outside a
// span, so the value reads the ponyfill leaf. renaming only the root would leave `_globalThis.self` - a
// raw `.self` read, undefined on every engine the ponyfill serves. a hop with no entry of its own has
// nothing to collapse to and keeps the root spelling. one static and one instance method per row, so a
// row that stops resolving leaves a hole in the import set.
export const hopInsideBuriedRoot = null == (_ref = (() => _self)()?.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(5)).call(_ref2, 0);
export const hopInsideIdentityArg = null == (_ref3 = (x => x)(_self)?.window) ? void 0 : _flatMaybeArray(_ref4 = _Object$entries({
  a: 1
})).call(_ref4);
export const deepHopInsideBuriedRoot = null == (_ref5 = (() => _self)()?.window) ? void 0 : _includesMaybeArray(_ref6 = _Object$values({
  b: 2
})).call(_ref6, 2);
export const unponyfillableHopStaysRooted = null == (_ref7 = (() => _globalThis.window)()?.window) ? void 0 : _flatMapMaybeArray(_ref8 = _Reflect$ownKeys({
  c: 3
})).call(_ref8, k => [k]);

// the same navigation under a static claim and under a ctor-field read: those fold the root into their
// own guard instead of memoizing it, and the collapse has to reach that render too
export const hopUnderStaticClaim = null == (() => _self)().window ? void 0 : _Array$from([1]);
export const hopUnderCtorField = null == (x => x)(_self).window ? void 0 : _Number$MAX_SAFE_INTEGER;

// BOUNDARY: the callee is declared above, so the navigation lives outside the rendered span and
// collapses through its own declaration
const above = () => _self;
export const declaredCalleeNav = null == (_ref9 = above()?.window) ? void 0 : _padStartMaybeString(_ref10 = _String$fromCodePoint(100)).call(_ref10, 3, '-');