import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A reaching key write resolves its value in the scope where the write executes. Shadows around a later reader must not change
// that key or capture its source binding.
const writeSide = 'copyWithin';
let written;
{
  const writeSide = 'at';
  written = writeSide;
}
export const viaWritten = list => _at(list).call(list);
const readSide = 'flat';
let outer;
outer = readSide;
let viaOuter;
{
  const readSide = 'findLast';
  viaOuter = list => _flatMaybeArray(list).call(list);
}
export { viaOuter };