import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// channel: transitive dependent default (U = T) with an opaque earlier param
function makeTransitive<T = number[], U = T>(x: T): U {
  return x as any;
}
_includesMaybeString(_ref = makeTransitive('str')).call(_ref, 's');