import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a nested pattern level's default is the receiver alone where the init's literal provably leaves the
// slot undefined - an absent key, a slot past an array's end, a `void` one - so only the default's
// family is owed; a slot something may still supply - a value, an inherited key, a spread - keeps both
function list() {
  return [1, 2];
}
const {
  A: {
    at
  } = list()
} = {};
const [{
  map
} = list()] = [];
const {
  A: {
    filter
  } = list()
} = {
  A: void 0
};
const {
  A: {
    find
  } = list()
} = {
  A: source
};
const {
  toString: {
    some
  } = list()
} = {};
const {
  A: {
    every
  } = list()
} = {
  ...rest
};
use(at, map, filter, find, some, every);