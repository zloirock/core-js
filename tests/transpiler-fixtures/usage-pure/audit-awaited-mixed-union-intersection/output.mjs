import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Mixed union + intersection inside Awaited: outer union distributes per-branch,
// each branch with intersection distributes Promise peeling. Both branches reduce
// to array Awaited<Promise<number[]>> = number[] and Awaited<Promise<string[]> & Y>
// = string[]; folding the union collapses to a common Array constructor. distinct methods
// per line probe per-branch dispatch through both distribution layers
async function mix() {
  type T = Promise<number[]> | (Promise<string[]> & {
    brand: 'tagged';
  });
  // @ts-expect-error a declaration inside a body, which tsc refuses, gives the row a value of a local type
  declare const r: Awaited<T>;
  _atMaybeArray(r).call(r, 0);
  _includesMaybeArray(r).call(r, 'x');
}
mix();