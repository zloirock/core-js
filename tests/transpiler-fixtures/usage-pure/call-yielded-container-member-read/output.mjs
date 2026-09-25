import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$values from "@core-js/pure/actual/object/values";
import _String$raw from "@core-js/pure/actual/string/raw";
// a MEMBER read through the container a call yields, the twin of the destructure form: a slot the
// callee fills from a parameter reads the argument THIS call passes, any other slot the callee's
// literal - through the call itself, a binding of it, a nested slot and a captured intermediate
// container alike. the Map call's value owes its constructor entry; no row takes its `groupBy`
const build = value => ({
  a: Math,
  b: value,
  n: {
    c: Object,
    d: value
  }
});
export const inlineLiteral = _Math$trunc(1.5);
export const inlineParam = _Object$groupBy([1], v => v);
const held = build(String);
export const boundLiteral = _Math$sign(-1);
export const boundParam = _String$raw`x`;
export const nestedLiteral = _Object$entries({});
export const nestedParam = _Math$cbrt(8);
const inner = build(Array).n;
export const capturedParam = _Array$of(1);
export const capturedLiteral = _Object$values({});
const other = build(_Map);