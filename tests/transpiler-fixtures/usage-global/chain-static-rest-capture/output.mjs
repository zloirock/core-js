import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Each assignment serves its own static read and yields the original receiver.
let from, rest;
const held = {
  from,
  ...rest
} = {
  from,
  ...rest
} = Array;
use(held === Array, from([1]), rest);