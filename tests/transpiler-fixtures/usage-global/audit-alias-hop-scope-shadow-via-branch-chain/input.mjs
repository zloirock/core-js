// a BRANCHING multi-hop chain resolves both arms (`Array.from` + `Iterator.from`) even when a
// param shadows the middle hop
const fromRoot = globalThis.cond ? Array : Iterator;
const fromLink = fromRoot;
export function viaBranchChain(fromRoot) {
  const { from } = fromLink;
  return from([1]);
}
