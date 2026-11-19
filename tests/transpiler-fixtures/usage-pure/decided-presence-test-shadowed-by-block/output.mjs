import _at from "@core-js/pure/actual/instance/at";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a presence test reading a name a block between it and the binding rebinds tests that local, not
// the global the read's scope sees - the build decides nothing of it, and the read stays native. a name
// only the READ rebinds (a closure parameter) is not the test's: that test decides, and the key claims
let key;
{
  const Symbol = undefined;
  if (typeof Symbol != 'undefined') key = _Symbol$iterator;
}
export const read = receiver => receiver[key];
let viaParam;
if (typeof _Symbol != 'undefined') viaParam = 'at';
export const readParam = (list, Symbol) => _at(list).call(list, 0);