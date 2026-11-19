// `switch (box.kind) { case 'a': ...; case 'b': ... }` - canonical TS discriminated-union
// pattern. a SwitchCase test must contribute a positive guard on the discriminant field so
// the case body sees the narrowed member; without it the body operates on the unrefined
// union and over-polyfills (`case 'a'` -> v: string MUST emit only `es.string.repeat`, not
// also `es.array.at`; the if/else equivalent is already narrowed correctly).
type Box = { kind: 'a'; v: string } | { kind: 'b'; v: number[] };
function probe(box: Box) {
  switch (box.kind) {
    case 'a': box.v.repeat(2); break;
    case 'b': box.v.at(-1); break;
  }
}
