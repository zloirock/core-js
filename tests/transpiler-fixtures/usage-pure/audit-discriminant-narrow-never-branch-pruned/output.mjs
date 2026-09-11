import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `never` branch in a discriminant union: the `x.kind === 'a'` guard is unreachable on a
// bottom-typed value, so the branch must be pruned during narrow. without TSNeverKeyword in the
// nullish-branch set the filter lets `never` survive, leaving an extra `data`-less branch that
// degrades `x.data` to the union's least-common surface. braced if-body keeps `var _ref;` aligned.
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
type Outer = Inner | never;
declare const x: Outer;
if (x.kind === 'a') {
  var _ref;
  _atMaybeArray(_ref = x.data).call(_ref, 0);
}