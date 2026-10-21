// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
const wrap = value => ({ a: value });
const { a: viaParam } = wrap(Object);
export const fromParam = viaParam.groupBy([1], v => v);
const other = wrap(Map);
const pair = value => ({ a: Object, b: value });
const { a: viaLiteralBeside, b: viaParamBeside } = pair(Math);
export const fromLiteralBeside = viaLiteralBeside.fromEntries([]);
export const fromParamBeside = viaParamBeside.log10(100);
const wrapArr = value => [value];
const [{ raw: viaWrappedParam }] = wrapArr(String);
export const fromWrappedParam = viaWrappedParam`x`;
const wrapKeyed = value => [{ a: value }];
const [{ a: { of: viaWrappedKeyed } }] = wrapKeyed(Array);
export const fromWrappedKeyed = viaWrappedKeyed(13);
