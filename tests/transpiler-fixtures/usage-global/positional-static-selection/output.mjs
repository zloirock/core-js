import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A static reached through a call keeps the call, iteration and native read before binding.
// An optional call still performs its native selection, including its nullish failure.
const make = () => [Object, 7];
let keys, tail;
[{
  keys
}, tail] = make();
const build = () => [Array];
const [{
  of
}] = build?.();
use(keys, tail, of);