import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// A default on a key core-js has no ponyfill for runs where the slot is missing, so a write in it
// still reaches a later read. An excluded module is no such key: the user's filter decides only what
// the build loads, so the static still counts as served, its default never runs and its write reaches
// nothing.
let list = [1, 2];
const {
  from = (list = 'ab', 0)
} = Array;
export const last = list.at(-1);
let rows = [3, 4];
const {
  foo = (rows = 'cd', 0)
} = Array;
export const found = rows.includes(3);
export const made = [from, foo];