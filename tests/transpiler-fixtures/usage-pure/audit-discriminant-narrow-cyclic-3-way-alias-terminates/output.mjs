import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// 3-way cyclic alias: A -> B -> C -> A. exercises that the cycle protection in the
// flattener works with longer cycles, not just direct 2-step (A=B; B=A) self-reference.
// each alias resolves to the same UnionType identity through the chain; the visited set
// catches the repeat at any level. C provides the only non-cyclic branch via D.
// braced if-body so the emitted `var _ref;` lands in the same slot across babel and
// unplugin runners (bodyless slot would force babel to hoist while unplugin block-wraps)
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