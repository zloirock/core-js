// In usage-global a key alias's write resolves where the write stands, so each read injects the method
// the write saw - every row names its own pair, and one resolved where the read stands would show the
// other: `at`, not `copyWithin`; `flat`, not `findLast`; `toReversed`, not `fill`; and a block `Symbol`
// brings in no iterator module
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
