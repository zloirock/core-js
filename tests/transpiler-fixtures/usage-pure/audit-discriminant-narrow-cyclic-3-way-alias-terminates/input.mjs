// 3-way cyclic alias: A -> B -> C -> A. cycle protection in the flattener must hold for longer
// cycles, not just a direct 2-step self-reference; each alias resolves to the same UnionType
// identity through the chain, and the repeat is caught at any level. C provides the only
// non-cyclic branch via D. braced if-body so `var _ref;` lands in the same slot across runners.
type D = {
  kind: 'd';
  data: string[];
};
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type C = A | D;
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type B = C;
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type A = B;
declare const x: A;
if (x.kind === 'd') {
  x.data.at(0);
}
