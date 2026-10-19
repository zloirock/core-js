// negative control: ambient `declare function` WITHOUT a TSTypePredicate return type
// must NOT narrow. only TSTypePredicate (asserts or `x is T`) triggers narrowing; generic
// ambient functions stay opaque - the polyfill dispatch widens to the generic instance form
declare function noop(x: unknown): void;
function probe(x: unknown) {
  noop(x);
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return x.at(0);
}
