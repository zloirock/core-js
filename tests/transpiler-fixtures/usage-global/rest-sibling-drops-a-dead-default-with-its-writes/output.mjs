import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// A rest sibling beside a leaf whose static the build serves changes nothing for the leaf's default:
// it never runs, so a write in it reaches no later read, through a declaration and through an
// assignment alike.
let list = [1, 2];
const {
  from = (list = 'ab', 0),
  ...rest
} = Array;
export const last = list.at(-1);
let rows = [3, 4],
  of,
  others;
({
  of = (rows = 'cd', 0),
  ...others
} = Array);
export const found = rows.includes(3);
export const made = [from([5]), rest, of(6), others];