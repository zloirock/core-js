// `!== 'b'` - negated discriminant via optional-chain. parseDiscriminantCheck carries
// positive=false for `!==`, narrowing filters the matching branch OUT. combined with
// the optional-chain ChainExpression unwrap via peelParensAndChain
type Shape = { kind: 'a'; data: number[] } | { kind: 'b'; data: string };
declare const s: Shape;
if (s?.kind !== 'b') {
  s.data.at(0);
}
