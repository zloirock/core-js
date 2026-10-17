// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens, and pure REWRITES what sits under them - the restoration reads the slot while the
// ponyfill substitution is still landing in it. dropped, the call re-associates into the arrow body
// / the ternary alternate / the optional chain; the tail lines are negatives and must stay bare
const g: any = (x: number) => x;
const o: any = { m: g };
const viaLogical = ((g || Object.groupBy)<any>)([], g);
const viaOptionalMember = ((o?.m)<any>)(1);
const viaMember = ((Map.groupBy)<any>)([], g);
const viaNonNull = ((Promise.try!)<any>)(g);

export const r = [viaLogical, viaOptionalMember, viaMember, viaNonNull];
