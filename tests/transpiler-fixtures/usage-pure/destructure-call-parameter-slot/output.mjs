import _Map from "@core-js/pure/actual/map/constructor";
import _Math$log10 from "@core-js/pure/actual/math/log10";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
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
const [{
  raw: viaWrappedParam
}] = wrapArr(String);
export const fromWrappedParam = viaWrappedParam`x`;
const wrapKeyed = value => [{
  a: value
}];
const [{
  a: {
    of: viaWrappedKeyed
  }
}] = wrapKeyed(Array);
export const fromWrappedKeyed = viaWrappedKeyed(13);