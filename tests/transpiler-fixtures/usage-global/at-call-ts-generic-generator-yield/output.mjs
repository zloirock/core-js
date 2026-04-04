import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function* items<T>(arr: T[]): Generator<T> {
  for (const item of arr) yield item;
}
for (const item of items(['hello'])) {
  item.at(0);
}