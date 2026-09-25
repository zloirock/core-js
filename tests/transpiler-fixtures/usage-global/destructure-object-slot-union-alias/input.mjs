// an alias bound through an OBJECT slot holds every arm of the slot's branching value, as the
// array-slot and reassignment spellings of the same union do: the static read reaches each arm
// (inject-if-might in usage-global; usage-pure guards the read on each arm it can name, and a
// default that cannot fire leaves the paired value's static served outright)
// one static per row, so every row is observable by its own module
const { a: A } = { a: c ? Array : Map };
export const viaTernary = A.from([1]);
const { b: B } = { b: m || Array };
export const viaLogical = B.of(2);
const { d: D = Map } = { d: Object };
export const viaDefault = D.hasOwn({}, 'k');
const { n: { e: E } } = { n: { e: c ? Map : Object } };
export const viaNested = E.groupBy([4], x => x);
