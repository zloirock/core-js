// a presence test reading a name a block between it and the binding rebinds tests that local, not
// the global the read's scope sees - the build decides nothing of it, and the read stays native. a name
// only the READ rebinds (a closure parameter) is not the test's: that test decides, and the key claims
let key;
{
  const Symbol = undefined;
  if (typeof Symbol != 'undefined') key = globalThis.Symbol.iterator;
}
export const read = receiver => receiver[key];
let viaParam;
if (typeof Symbol != 'undefined') viaParam = 'at';
export const readParam = (list, Symbol) => list[viaParam](0);
