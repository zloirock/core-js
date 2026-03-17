import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
interface StringIterable extends Iterable<string> {}
function foo(items: StringIterable) {
  for (const x of items) {
    x.at(-1);
  }
}