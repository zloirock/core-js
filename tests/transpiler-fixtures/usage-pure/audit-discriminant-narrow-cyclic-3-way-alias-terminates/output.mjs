import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// 3-way cyclic alias: A -> B -> C -> A. cycle protection in the flattener must hold for longer
// cycles, not just a direct 2-step self-reference; each alias resolves to the same UnionType
// identity through the chain, and the repeat is caught at any level. C provides the only
// non-cyclic branch via D. braced if-body so `var _ref;` lands in the same slot across runners.
type D = {
  kind: 'd';
  data: string[];
};
type C = A | D;
type B = C;
type A = B;
declare const x: A;
if (x.kind === 'd') {
  var _ref;
  _atMaybeArray(_ref = x.data).call(_ref, 0);
}