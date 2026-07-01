// Self-recursive Promise alias `type R = Promise<R>` would loop forever during recursive
// Promise-peel. The Awaited-unwrap depth bound plus the alias-chain walk's `visited` Set
// must terminate; resolver gracefully degrades to generic dispatch (no Awaited resolution)
async function recursiveAwait() {
  type Recur = Promise<Recur>;
  declare const v: Awaited<Recur>;
  v.at(0);
  v.includes('x');
}
recursiveAwait();
