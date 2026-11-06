import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
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