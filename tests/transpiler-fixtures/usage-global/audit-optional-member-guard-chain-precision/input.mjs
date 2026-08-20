// a predicate guard reached through an OPTIONAL member (`a?: Leaf`) must still narrow the argument
// type the same way a required member does: the optional wrapper on the member type is peeled at
// member enumeration, so the `number[]` argument stays precise and only the array polyfill injects
// (a stale wrapper made the chain bail -> over-inject the string polyfill too)
interface Leaf { pick(v: number[]): boolean; }
interface Root { a?: Leaf; }
declare const i: Root;
declare const v: number[];
if (i.a.pick(v)) {
  v.at(0);
}
