import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _String$raw from "@core-js/pure/actual/string/raw";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a probe guard tests the `window` read the first unresolvable `?.` makes, whatever spells the root:
// a second `window` past it is the realm itself and earns no test of its own, and a `?.` over a
// proven root may stay inside the test. a root nothing proves keeps its own `?.` as the test - a
// callee the file assigns conditionally, an optional call link, a call returning a local object.
export const bareRootTwoHops = null == _globalThis.window ? void 0 : _withMaybeArray(_ref = _Array$of(1)).call(_ref, 0, 9);
export const optionalRootTwoHops = null == _globalThis.window ? void 0 : _includesMaybeArray(_ref2 = _Array$from([2])).call(_ref2, 2);
const dr = () => _globalThis;
export const provenRootTwoHops = null == dr()?.window ? void 0 : _findLastMaybeArray(_ref3 = _Object$values({
  v: 3
})).call(_ref3, v => v);
const sr = () => _globalThis;
export const provenRootOneHop = null == sr()?.window ? void 0 : _flatMaybeArray(_ref4 = _Object$entries({
  e: 4
})).call(_ref4);
let maybeFn;
if (_globalThis.setTimeout) maybeFn = () => _globalThis;
export const conditionalCalleeKeepsGuards = null == maybeFn?.()?.window ? void 0 : _padEndMaybeString(_ref5 = _String$raw({
  raw: ['k']
})).call(_ref5, 2);
const provenFn = () => _globalThis;
export const optionalCallLinkKeepsGuard = null == provenFn?.()?.window ? void 0 : _padStartMaybeString(_ref6 = _String$fromCodePoint(65)).call(_ref6, 2);
const opaque = () => ({
  window: {
    self: {
      Array
    }
  }
});
export const opaqueRootKeepsGuard = null == (_ref7 = opaque()?.window?.self) ? void 0 : _at(_ref8 = _ref7.Array.of(7)).call(_ref8, 0);