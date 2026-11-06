// an UNCOVERED sibling key re-reads off the receiver value (a fresh literal read matches the
// native fresh-value semantics); aliased and defaulted props register through the same peel;
// an optional call keeps its argument; an immediate `.call` invocation uses the closed caller mirror
export const viaMixedProps = (({ flatMap, other }) => [flatMap, other])([1, 2]);
