import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-x HEAD that declares NOTHING still names what its pattern reads: a nested level under a
// static key is a read of that static, so the module is owed whether or not the head declares a
// binding. one constructor per line - the import set is the only observable here, and two lines
// sharing a family would mask each other
let viaOf, viaEntries, viaGroup;
for ({
  of: {
    name: viaOf
  }
} of [Array]) eff(viaOf);
for ({
  fromEntries: {
    name: viaEntries
  }
} of [Object]) eff(viaEntries);
for ({
  groupBy: {
    name: viaGroup
  }
} of [Map]) eff(viaGroup);

// The call runs once before the loop binds the nested static.
function make() {
  eff();
  return Array;
}
for ({
  of: {
    name: via
  }
} of [make()]) eff(via);