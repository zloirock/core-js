// A reaching key write resolves its value in the scope where the write executes. Shadows around a later reader must not change
// that key or capture its source binding.
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
