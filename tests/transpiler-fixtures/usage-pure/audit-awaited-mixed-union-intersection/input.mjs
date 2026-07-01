// Mixed union + intersection inside Awaited: outer union distributes per-branch,
// each branch with intersection distributes Promise peeling. Both branches reduce
// to array Awaited<Promise<number[]>> = number[] and Awaited<Promise<string[]> & Y>
// = string[]; folding the union collapses to a common Array constructor. distinct methods
// per line probe per-branch dispatch through both distribution layers
async function mix() {
  type T = Promise<number[]> | (Promise<string[]> & { brand: 'tagged' });
  declare const r: Awaited<T>;
  r.at(0);
  r.includes('x');
}
mix();
