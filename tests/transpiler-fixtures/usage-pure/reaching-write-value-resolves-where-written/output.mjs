import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _at from "@core-js/pure/actual/instance/at";
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
let symbolKey;
{
  const Symbol = {
    iterator: 'own'
  };
  symbolKey = Symbol.iterator;
}
export const viaSymbolKey = receiver => receiver[symbolKey];
const bothSides = 'fill';
let viaShared;
{
  const bothSides = 'toReversed';
  let shared;
  shared = bothSides;
  viaShared = list => _toReversedMaybeArray(list).call(list);
}
export { viaShared };