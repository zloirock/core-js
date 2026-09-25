import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// a container slot the file wrote no longer holds the literal's type: an instance method read through
// a pattern write, a slot of a pattern alias or the literal a call yields dispatches generically in pure
// and injects every family in usage-global - the member spelling's answer - so a string written over an
// array literal, and an array written over a string literal, each reach their own polyfill
const box = {
  a: [1, 2]
};
box.a = 'ab';
let viaWrite = [];
({
  a: viaWrite
} = box);
export const last = viaWrite.at(-1);
const list = [[1, 2]];
list[0] = 'cd';
const [alias] = [list];
const [viaAlias] = alias;
export const has = viaAlias.includes('d');
const make = () => ({
  f: 'ef'
});
const made = make();
made.f = [[1], [2]];
export const flat = made.f.flat();