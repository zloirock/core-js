import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// an ALWAYS-TRUTHY left operand decides a logical statically: `A || B` / `A ?? B` narrows to
// the left type, `A && B` narrows to the RIGHT - instead of the two-operand union, which
// injected entries the runtime value never has (the Iterator variant for an Array/plain-object
// pair, the array variant for an always-string `&&` result). negative: a falsy-able primitive
// left keeps the union, so both multi-type variants stay injected
const {
  map
} = Array.prototype || {};
export const r1 = typeof map;
const arr = [1, 2];
export const r2 = (arr ?? []).includes(1);
const s = 'ab';
export const r3 = (s || [3]).includes('a');
export const r4 = (arr && 'yz').at(-1);