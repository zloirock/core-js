// a `typeof ... == 'function'` presence test decides like its `!= 'undefined'` twin, in either operand
// order: the arm it always takes holds the key and its fallback never runs. a write the test always
// skips - `!= 'function'`, a type the global never has - leaves the key unwritten, its read native
let guarded;
if (typeof Symbol == 'function') guarded = Symbol.iterator;
export const readGuarded = receiver => receiver[guarded];
let liveElse;
if (typeof Symbol != 'function') liveElse = '@@iterator';
else liveElse = Symbol.iterator;
export const readLiveElse = receiver => receiver[liveElse];
let reversed;
if ('function' == typeof Symbol) reversed = Symbol.iterator;
else reversed = '@@iterator';
export const readReversed = receiver => receiver[reversed];
const selected = 'function' === typeof Symbol ? Symbol.iterator : '@@iterator';
export const readSelected = receiver => receiver[selected];
export const readDirect = receiver => receiver[typeof Symbol !== 'function' ? '@@iterator' : Symbol.iterator];
let skipped;
if (typeof Symbol != 'function') skipped = Symbol.iterator;
export const readSkipped = receiver => receiver[skipped];
let otherType;
if (typeof Symbol == 'object') otherType = Symbol.iterator;
export const readOtherType = receiver => receiver[otherType];
