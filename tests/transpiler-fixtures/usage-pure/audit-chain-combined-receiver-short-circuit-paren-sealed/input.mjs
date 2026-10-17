// NEGATIVE: parens TERMINATE the chain - the sealed `?.` no longer short-circuits what
// follows, so the receiver keeps its testless form and throws like native
export function parenSealed(a) {
  return (a?.b).c.flat?.().map(x => x).length;
}
