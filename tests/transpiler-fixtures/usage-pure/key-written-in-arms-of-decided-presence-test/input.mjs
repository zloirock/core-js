// a presence test the build always answers takes one arm on every path: the write there is the key's
// value, and the fallback the other arm spells never runs - in either order of the arms, and over a
// fallback init, and a dead fallback written after the read - a PATTERN writing it too, over an init and
// over a plain write alike. an undecided test may take either arm, and a closure may observe a live write
// after it, so those reads stay native
let liveElse;
if (typeof Symbol == 'undefined') liveElse = '@@iterator';
else liveElse = Symbol.iterator;
export const readLiveElse = receiver => receiver[liveElse];
let deadElse;
if (typeof Symbol != 'undefined') {
  deadElse = Symbol.iterator;
} else {
  deadElse = '@@iterator';
}
export const readDeadElse = receiver => receiver[deadElse];
let fallbackInit = '@@iterator';
if (typeof Symbol != 'undefined') fallbackInit = Symbol.iterator;
export const readFallbackInit = receiver => receiver[fallbackInit];
let undecided;
if (flag) undecided = 'values';
else undecided = Symbol.iterator;
export const readUndecided = receiver => receiver[undecided];
let laterFallback;
if (typeof Symbol != 'undefined') laterFallback = Symbol.iterator;
export const readBeforeDeadFallback = receiver => receiver[laterFallback];
if (typeof Symbol == 'undefined') laterFallback = '@@iterator';
let laterWrite;
if (typeof Symbol != 'undefined') laterWrite = Symbol.iterator;
export const readBeforeLiveWrite = receiver => receiver[laterWrite];
if (flag) laterWrite = 'values';
let patternFallbackInit = Symbol.iterator;
if (typeof Symbol == 'undefined') [patternFallbackInit] = ['@@iterator'];
export const readPatternFallbackInit = receiver => receiver[patternFallbackInit];
let patternFallbackWrite;
patternFallbackWrite = Symbol.iterator;
if (typeof Symbol == 'undefined') [patternFallbackWrite] = ['@@iterator'];
export const readPatternFallbackWrite = receiver => receiver[patternFallbackWrite];
