import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _self from "@core-js/pure/actual/self";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// A plain navigation ending at a backed value does not invent a guard for a
// middle environment hop. Storing that value preserves writes and key effects.
// A source optional over a terminal environment probe remains live, and a
// stored terminal probe keeps its final read instead of becoming the realm.
// A source optional inside the navigation also keeps its original short-circuit.
let a, b, c, d, e, f, g, h, m;
let k = 0;
export const swallowedProbe = (a = _self.Number, _Number$isInteger)(1);
export const readThroughProbe = (b = _self.Object, _Object$getOwnPropertyNames)({});
export const plainClaimTwin = (c = _self.Number, _Number$parseFloat)('1.5');
export const foldedThenSwallowed = (f = _self.Object, _Object$getOwnPropertySymbols)({});
export const vestigialOverTheLanding = (g = _self.Number, _Number$parseInt)('7', 10);
export const sourceOptionalOverAFoldedHop = null == (h = _self.window?.Number) ? void 0 : _Number$isInteger(3);
export const probeAboveTheRootLanding = (e = _Symbol, _Symbol$for)('fc362');
export const sourceWroteTheHop = null == (d = null == _globalThis.window ? void 0 : _self.Array) ? void 0 : _Array$from([1]);
export const prefixLeafIsTheProbe = null == (m = _self[k++, 'window']) ? void 0 : _Number$isInteger(1);
// A computed unbacked prefix preserves the optional over the next constructor read.
export const computedPrefixProbe = null == (a = (null == _globalThis.window ? void 0 : _self['window'])?.Array) ? void 0 : _Array$of(1);
export const computedPrefixPlain = null == (b = null == _globalThis.window ? void 0 : _self['window'].Array) ? void 0 : _Array$from([]);
export const dottedPrefixProbe = null == (c = (null == _globalThis.window ? void 0 : _self.window)?.Number) ? void 0 : _Number$isFinite(1);
export { a, b, c, d, e, f, g, h, k, m };