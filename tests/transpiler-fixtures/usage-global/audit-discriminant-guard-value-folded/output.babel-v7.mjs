import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.string.includes";
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
  Second = 2,
}
if (tagged.kind === typedOnly) {
  tagged.a.at(0);
}
if (tagged.kind === aliased) {
  tagged.a.includes("x");
}
if (tagged.kind === Kind.First) {
  tagged.a.find(x => x);
}
if (named.tag === `y`) {
  named.items.padStart(2);
}