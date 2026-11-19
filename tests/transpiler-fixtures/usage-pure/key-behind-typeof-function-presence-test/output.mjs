import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a `typeof ... == 'function'` presence test decides like its `!= 'undefined'` twin, in either operand
// order: the arm it always takes holds the key and its fallback never runs. a write the test always
// skips - `!= 'function'`, a type the global never has - leaves the key unwritten, its read native
let guarded;
if (typeof _Symbol == 'function') guarded = _Symbol$iterator;
export const readGuarded = receiver => _getIteratorMethod(receiver);
let liveElse;
if (typeof _Symbol != 'function') liveElse = '@@iterator';else liveElse = _Symbol$iterator;
export const readLiveElse = receiver => _getIteratorMethod(receiver);
let reversed;
if ('function' == typeof _Symbol) reversed = _Symbol$iterator;else reversed = '@@iterator';
export const readReversed = receiver => _getIteratorMethod(receiver);
const selected = _Symbol$iterator;
export const readSelected = receiver => _getIteratorMethod(receiver);
export const readDirect = receiver => _getIteratorMethod(receiver);
let skipped;
if (typeof _Symbol != 'function') skipped = _Symbol$iterator;
export const readSkipped = receiver => receiver[skipped];
let otherType;
if (typeof _Symbol == 'object') otherType = _Symbol$iterator;
export const readOtherType = receiver => receiver[otherType];