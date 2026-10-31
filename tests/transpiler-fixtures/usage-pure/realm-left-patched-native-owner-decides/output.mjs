import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _RegExp$escape from "@core-js/pure/actual/regexp/escape";
import _self from "@core-js/pure/actual/self";
import _TypeError$isError from "@core-js/pure/actual/type-error/is-error";
// A `||` / `??` left read off the realm of a global core-js patches in place and ships no pure replacement of
// (`Number`, `RegExp`, the `Error` constructors, `ArrayBuffer`, `Uint8Array`) decides the selection as `Array`
// does: every engine carries it, so the right is dead text - the selection folds to its left and the left's
// statics take their pure entries where they have one; a disabled line keeps the source.
export const integer = _Number$isInteger(1);
export const escaped = _RegExp$escape('a.b');
export const errorCheck = _TypeError$isError(value);
export const view = 'isView' in _self.ArrayBuffer;
export const fromHex = _globalThis.Uint8Array.fromHex('ff');
// core-js-disable-next-line
export const kept = (globalThis.Number || Set).isNaN(value);