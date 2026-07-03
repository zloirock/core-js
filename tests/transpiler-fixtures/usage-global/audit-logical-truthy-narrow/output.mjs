import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// an ALWAYS-TRUTHY left operand decides `A || B` / `A ?? B` statically, so the receiver narrows
// to the left type instead of the two-operand union - the union injected entries NEITHER operand
// is (the Iterator variant for an Array/plain-object pair). negatives: a falsy-able primitive
// left keeps the union, and `&&` is not folded by design (the no-polyfill collapse path must
// unify across emitters first), so both keep the multi-type union injection
const {
  map
} = Array.prototype || {};
export const r1 = typeof map;
const arr = [1, 2];
export const r2 = (arr ?? []).at(0);
const s = 'ab';
export const r3 = (s || [3]).includes('a');
export const r4 = (arr && 'yz').at(-1);