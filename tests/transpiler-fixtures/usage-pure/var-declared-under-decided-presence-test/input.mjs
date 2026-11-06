// a `var` a decided presence test declares in the arm it always takes holds that value on every
// path - with or without a block, whichever arm comes first, a key or a constructor alike - so its
// reads claim through it. an undecided pair of arms holds whichever ran, so its read stays native
if (typeof Symbol != 'undefined') var guarded = 'at';
export const first = list => list[guarded](0);
if (typeof Promise != 'undefined') var Ctor = Promise;
export const resolved = () => Ctor.resolve(1);
if (typeof Symbol === 'function') {
  var ITER = Symbol.iterator;
} else {
  var ITER = '@@iterator';
}
export function getIter(o) {
  return o[ITER];
}
if (typeof Symbol == 'undefined') var LATE = '@@iterator';
else var LATE = Symbol.iterator;
export const readLate = o => o[LATE];
if (flag) var either = 'of';
else var either = 'from';
export const pick = list => Array[either](list);
