import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/web.dom-collections.values";
// A selection whose native-owner arm this file writes - the static (`Number.isSafeInteger`) or the
// global's slot (`Math`) - still injects the arm's static, whichever value the write left there
Number.isSafeInteger = shimIsSafeInteger;
export const viaWrittenStatic = (shim || Number).isSafeInteger(7);
globalThis.Math = ShimMath;
export const viaWrittenSlot = (shim || Math).trunc(1.5);
Object.values = shimValues;
export const viaWrittenInstanceKey = (source ?? Object).values(pairs);