import "core-js/modules/es.array.at";
// an explicit type-arg that is a bare reference colliding with an earlier type-param name
// (`Wrap<string, A>` over `interface Wrap<A, Q>`, with `type A = number[]`) must resolve in the
// caller scope, not be captured by the sibling param `A`: `o.v` is `number[]`, so `.at` injects the
// array variant `es.array.at`. a capture regression would type `o.v` as string and emit `es.string.at`
type A = number[];
interface Wrap<A, Q> {
  v: Q;
}
declare const o: Wrap<string, A>;
o.v.at(0);