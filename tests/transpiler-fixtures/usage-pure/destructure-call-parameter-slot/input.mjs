// A callee-filled slot reflects the argument of that particular call.
// Later statics retain their own argument's hint; nested literal-wrapper statics stay native.
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
