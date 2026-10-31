import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested pattern can read the supplied constructor or its different default.
// The default must not hide the raw static read on a substituted source.
let sources = [Array];
let observed;
for (let i = 0; i < 1; i++) {
  sources = [Map];
  const [{
    groupBy
  } = Object] = sources;
  observed = groupBy;
}
export { observed };