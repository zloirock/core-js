// Extract<U, T> distributes over a union-of-unions via type-alias hops:
// type A = number[] | string[]; type B = boolean[] | A; -> Extract<B, number[]|string[]>
// expands union members across the alias chain. The source union is unwrapped once, so an
// inner alias `A` must still expand to its constituents when iterated. Probe whether
// nested-alias union members are flattened during union member resolution.
type Inner = number[] | string[];
type Outer = boolean[] | Inner;
type Filtered = Extract<Outer, number[] | string[]>;
declare const v: Filtered;
v.at(0);
v.findLast(x => true);
