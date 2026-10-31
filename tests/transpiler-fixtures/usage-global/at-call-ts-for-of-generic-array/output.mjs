import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function foo(items: Array<number>) {
  for (const item of items) {
    // @ts-expect-error the member read is the probe, and the right answer is a type without it
    item.at(-1);
  }
}