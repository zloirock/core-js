import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
for (const Map of items) {
  Map.groupBy([], x => x);
}
for (const Array of items) {
  Array.from([1]);
}