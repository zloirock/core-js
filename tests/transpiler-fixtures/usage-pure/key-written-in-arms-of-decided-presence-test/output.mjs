import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a presence test the build always answers takes one arm on every path: the write there is the key's
// value, and the fallback the other arm spells never runs - in either order of the arms, and over a
// fallback init, and a dead fallback written after the read - a PATTERN writing it too, over an init and
// over a plain write alike. an undecided test may take either arm, and a closure may observe a live write
// after it, so those reads stay native
let liveElse;
if (typeof _Symbol == 'undefined') liveElse = '@@iterator';else liveElse = _Symbol$iterator;
export const readLiveElse = receiver => _getIteratorMethod(receiver);
let deadElse;
if (typeof _Symbol != 'undefined') {
  deadElse = _Symbol$iterator;
} else {
  deadElse = '@@iterator';
}
export const readDeadElse = receiver => _getIteratorMethod(receiver);
let fallbackInit = '@@iterator';
if (typeof _Symbol != 'undefined') fallbackInit = _Symbol$iterator;
export const readFallbackInit = receiver => _getIteratorMethod(receiver);
let undecided;
if (flag) undecided = 'values';else undecided = _Symbol$iterator;
export const readUndecided = receiver => receiver[undecided];
let laterFallback;
if (typeof _Symbol != 'undefined') laterFallback = _Symbol$iterator;
export const readBeforeDeadFallback = receiver => _getIteratorMethod(receiver);
if (typeof _Symbol == 'undefined') laterFallback = '@@iterator';
let laterWrite;
if (typeof _Symbol != 'undefined') laterWrite = _Symbol$iterator;
export const readBeforeLiveWrite = receiver => receiver[laterWrite];
if (flag) laterWrite = 'values';
let patternFallbackInit = _Symbol$iterator;
if (typeof _Symbol == 'undefined') [patternFallbackInit] = ['@@iterator'];
export const readPatternFallbackInit = receiver => _getIteratorMethod(receiver);
let patternFallbackWrite;
patternFallbackWrite = _Symbol$iterator;
if (typeof _Symbol == 'undefined') [patternFallbackWrite] = ['@@iterator'];
export const readPatternFallbackWrite = receiver => _getIteratorMethod(receiver);