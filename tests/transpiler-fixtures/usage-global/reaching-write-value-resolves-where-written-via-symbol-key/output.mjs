import "core-js/modules/es.array.to-reversed";
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
  viaShared = list => list[shared]();
}
export { viaShared };