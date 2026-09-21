import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Array patterns preserve a selected static method's known result type.
// The source prefix runs before binding, and repeated loop elements select the same static.
const [{
  from: make
}] = (effect(), [Array]);
export const first = make([1]).at(0);
let keys;
[{
  keys
}] = [Object];
export const second = keys({
  a: 1
}).includes('a');
for (const [{
  of: wrap
}] of [[Array], [Array]]) consume(wrap(2).map(value => value + 1));