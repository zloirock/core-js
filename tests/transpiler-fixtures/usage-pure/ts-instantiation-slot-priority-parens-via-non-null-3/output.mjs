import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens, and pure REWRITES what sits under them - the restoration reads the slot while the
// ponyfill substitution is still landing in it. dropped, the call re-associates into the arrow body
// / the ternary alternate / the optional chain; the tail lines are negatives and must stay bare
const g: any = (x: number) => x;
const o: any = {
  m: g
};
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaLogical = (g || _Object$groupBy)<any>([], g);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaOptionalMember = (o?.m)<any>(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaMember = _Map$groupBy<any>([], g);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaNonNull = _Promise$try<any>(g);
export const r = [viaLogical, viaOptionalMember, viaMember, viaNonNull];