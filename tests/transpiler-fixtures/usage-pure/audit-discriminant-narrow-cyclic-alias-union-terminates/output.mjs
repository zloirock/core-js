import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Cyclic alias-to-union: `type A = B | C; type B = A;`. expanding A resolves to the
// same UnionType identity through both B and C, so without cycle protection the
// flattener recurses forever (RangeError "Maximum call stack size exceeded"). visited
// set keyed on resolved-union identity terminates the walk on cycle hit, leaving the
// ref un-expanded - the discriminant filter then bails permissively and the array.at
// narrow flows through C's data field correctly.
// braced if-body so the emitted `var _ref;` lands in the same slot across babel and
// unplugin runners (bodyless slot would force babel to hoist while unplugin block-wraps)
type C = {
  kind: 'c';
  data: string[];
};
type B = A;
type A = B | C;
declare const x: A;
if (x.kind === 'c') {
  var _ref;
  _atMaybeArray(_ref = x.data).call(_ref, 0);
}