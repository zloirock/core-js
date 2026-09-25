import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Math$log10 from "@core-js/pure/actual/math/log10";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _String$raw from "@core-js/pure/actual/string/raw";
// a slot the callee fills from a PARAMETER holds the argument THIS call passes: an object slot, one
// beside a literal slot, an array wrapper's element, a keyed slot under the wrapper. another call of
// the same callee passing Map (whose value owes its constructor entry) leaves the Object row with its
// own argument alone - no `groupBy` of Map rides on it. one static per row
const wrap = value => ({
  a: value
});
const {
  a: viaParam
} = wrap(Object);
export const fromParam = _Object$groupBy([1], v => v);
const other = wrap(_Map);
const pair = value => ({
  a: Object,
  b: value
});
const {
  a: viaLiteralBeside,
  b: viaParamBeside
} = pair(Math);
export const fromLiteralBeside = _Object$fromEntries([]);
export const fromParamBeside = _Math$log10(100);
const wrapArr = value => [value];
const viaWrappedParam = _String$raw;
export const fromWrappedParam = viaWrappedParam`x`;
const wrapKeyed = value => [{
  a: value
}];
const viaWrappedKeyed = _Array$of;
export const fromWrappedKeyed = viaWrappedKeyed(13);