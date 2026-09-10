// The `default` clause narrows by excluding every explicit case value, and it is reached only once
// EVERY test has been evaluated - including the ones written below it. A test the emitter has
// rebuilt carries no span to place, so it could stand anywhere and the whole exclusion is dropped:
// `box.v` keeps both arms and takes the generic helper. Reading the literal `'a'` test alone would
// exclude the string arm on evidence the rebuilt test may contradict.
type Box = { kind: 'a'; v: string } | { kind: 'b'; v: number[] };
function probe(box: Box, s: string) {
  switch (box.kind) {
    case 'a': break;
    case s.at(0): break;
    default: box.v.at(-1); break;
  }
}
probe(null as any, '');
