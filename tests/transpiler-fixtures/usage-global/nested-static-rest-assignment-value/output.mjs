import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested static beside an object rest in an assignment whose value is read: the nested level binds
// nothing of its own - its read stays in place - and the assignment still yields its receiver, the
// array's too where the level is an element.
let entries, rest, isInteger, others, of, tail, z;
const source = {
  w: Object,
  extra: 1
};
const held = {
  w: {
    entries
  },
  ...rest
} = source;
const target = {
  n: Number,
  more: 2
};
const same = ({
  n: {
    isInteger
  },
  ...others
} = target) === target;
const count = ([{
  s: {
    of
  },
  ...tail
}, z] = [{
  s: Array,
  e: 1
}, 2]).length;
use(held === source, same, count, entries({}), isInteger(1), of(2), rest, others, tail, z);