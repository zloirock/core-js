import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Both array patterns read the same captured container and exclude the static from rest.
let from, rest;
const source = [Array];
const held = [{
  from,
  ...rest
}] = [{
  from,
  ...rest
}] = source;
use(held === source, from([1]), rest);