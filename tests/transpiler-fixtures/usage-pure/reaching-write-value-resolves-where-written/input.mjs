// the value a write gives a key alias resolves where the write stands, each row with its own pair of
// names: a block around the write gives the key the write's `at`, not the outer `copyWithin`; a block
// around a closure reading the key rebinds nothing the write saw, so the key claims the outer `flat`;
// a block `Symbol` makes its `iterator` an ordinary key, read as written; a block holding the
// declaration, the write and the shadow alike resolves the key in that block, `toReversed`
const writeSide = 'copyWithin';
let written;
{
  const writeSide = 'at';
  written = writeSide;
}
export const viaWritten = list => list[written]();
const readSide = 'flat';
let outer;
outer = readSide;
let viaOuter;
{
  const readSide = 'findLast';
  viaOuter = list => list[outer]();
}
export { viaOuter };
let symbolKey;
{
  const Symbol = { iterator: 'own' };
  symbolKey = Symbol.iterator;
}
export const viaSymbolKey = receiver => receiver[symbolKey];
const bothSides = 'fill';
let viaShared;
{
  const bothSides = 'toReversed';
  let shared;
  shared = bothSides;
  viaShared = list => list[shared]();
}
export { viaShared };
