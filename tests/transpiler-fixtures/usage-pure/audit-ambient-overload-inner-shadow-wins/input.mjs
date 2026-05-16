// Inner-scope ambient overload must SHADOW outer-scope siblings (TS lexical scoping).
// the ambient overload collector previously walked the entire scope chain without
// stopping, so the outer two `fn` overloads polluted the inner scope's match list.
// `pickLastAmbientOverload.at(-1)` then returned an outer overload (last in append
// order = the second outer declaration) while TS would have used the inner overload.
// fix stops collection at the innermost scope that produced any matches.
declare function fn(x: number): string;
declare function fn(x: string): string;
function probe() {
  declare function fn(x: boolean): number[];
  declare const r: ReturnType<typeof fn>;
  r.at(0);
}
