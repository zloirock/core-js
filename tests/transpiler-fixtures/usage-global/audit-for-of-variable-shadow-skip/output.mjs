import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `for (const X of ...)` loop variable shadows a known global inside the body:
// subsequent uses of `X` inside the loop skip polyfill emission.
for (const Map of items) {
  Map.groupBy([], x => x);
}
for (const Array of items) {
  Array.from([1]);
}