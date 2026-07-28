import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// A guard's right-hand side may be folded from a binding instead of written as a literal.
// Every fold path has to keep the value's runtime type, or a numeric tag stops matching its
// numeric branch while a string one still matches. One method per row keeps each path
// attributable: the literal-typed binding, the const alias, the enum member, the template.
type Tagged = {
  kind: 1;
  a: number[];
} | {
  kind: 2;
  a: string;
};
type Named = {
  tag: "x";
  items: number[];
} | {
  tag: "y";
  items: string;
};
declare const tagged: Tagged;
declare const named: Named;
declare const typedOnly: 1;
const aliased = 2;
enum Kind {
  First = 1,
  Second = 2
}
if (tagged.kind === typedOnly) {
  var _ref;
  _atMaybeArray(_ref = tagged.a).call(_ref, 0);
}
if (tagged.kind === aliased) {
  var _ref2;
  _includesMaybeString(_ref2 = tagged.a).call(_ref2, "x");
}
if (tagged.kind === Kind.First) {
  var _ref3;
  _findMaybeArray(_ref3 = tagged.a).call(_ref3, x => x);
}
if (named.tag === `y`) {
  var _ref4;
  _padStartMaybeString(_ref4 = named.items).call(_ref4, 2);
}