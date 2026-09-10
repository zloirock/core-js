// A key-first container has no slot for either written parameter: this layer holds one element and
// `Map` keys off the first. Two Map instantiations that differ only in a type argument are not
// compared here, so neither branch is knowable and the generic helper is the answer - `at` reads on
// both families and shows which one was taken.
interface Wanted { wanted: string }
interface Other { other: number }
type Sel<T> = T extends Map<Other, number> ? number[] : string;
declare const v: Map<Wanted, number>;
declare const r: Sel<typeof v>;
r.at(0);
