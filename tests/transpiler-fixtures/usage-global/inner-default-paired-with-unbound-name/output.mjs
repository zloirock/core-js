import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an unbound name reads a realm slot, and a capitalised one is no more proven present than any other:
// where another script left that slot `undefined` the default fires, so the default's static is
// injected on every pairing host - one static per row, so a dropped host shows in the import set. the
// last row is the control: a known built-in's pair keeps its own claim
function use() {/* empty */}
const [{
  groupBy
} = Map] = [UserMaps];
for (const [{
  fromAsync
} = Array] of [[UserArrays]]) use(fromAsync);
(({
  fromEntries
} = Object) => use(fromEntries))(UserObjects);
const {
  k: {
    of
  } = Array
} = {
  k: UserLists
};
const [{
  isInteger
} = {}] = [Number];
use(groupBy, of, isInteger);