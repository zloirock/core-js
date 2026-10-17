import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A presence test the build always answers takes one arm on every path: the write there is the key's value, and the fallback the
// other arm spells never runs - in either order of the arms, and over a fallback init, and a dead fallback written after the read
// - a PATTERN writing it too, over an init and over a plain write alike.
let liveElse;
if (typeof _Symbol == 'undefined') liveElse = '@@iterator';else liveElse = _Symbol$iterator;
export const readLiveElse = receiver => _getIteratorMethod(receiver);