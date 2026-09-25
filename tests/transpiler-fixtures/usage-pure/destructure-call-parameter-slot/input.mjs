// a slot the callee fills from a PARAMETER holds the argument THIS call passes: an object slot, one
// beside a literal slot, an array wrapper's element, a keyed slot under the wrapper. another call of
// the same callee passing Map (whose value owes its constructor entry) leaves the Object row with its
// own argument alone - no `groupBy` of Map rides on it. one static per row
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
