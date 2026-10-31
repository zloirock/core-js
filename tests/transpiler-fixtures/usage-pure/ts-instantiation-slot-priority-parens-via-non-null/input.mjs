// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens, and pure REWRITES what sits under them - the restoration reads the slot while the
// ponyfill substitution is still landing in it. dropped, the call re-associates into the arrow body
// / the ternary alternate / the optional chain; the tail lines are negatives and must stay bare
const g: any = (x: number) => x;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaConditional = ((g ? Array.of : g)<any>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaLogical = ((g || Object.groupBy)<any>)([], g);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaMember = ((Map.groupBy)<any>)([], g);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaNonNull = ((Promise.try!)<any>)(g);

export const r = [viaConditional, viaLogical, viaMember, viaNonNull];
