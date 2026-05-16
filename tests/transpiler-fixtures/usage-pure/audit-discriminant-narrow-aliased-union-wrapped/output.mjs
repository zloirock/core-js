import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// discriminated union behind a NAMED alias, wrapped in `| null`: `type Inner = A | B;
// type Outer = Inner | null`. exercises `flattenUnionBranches`'s alias-walk -- the
// outer union has [Inner-ref, null] as branches; Inner-ref must be followed through its
// alias to expose the inner [A, B] members before the discriminant filter can match each
// individually. without flatten, `findTypeMember(Inner, 'kind')` returns a union of all
// `kind` literals, no single value to compare, branch passes permissively.
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
type Outer = Inner | null;
declare const x: Outer;
if (x.kind === 'a') {
  var _ref;
  _atMaybeArray(_ref = x.data).call(_ref, 0);
}