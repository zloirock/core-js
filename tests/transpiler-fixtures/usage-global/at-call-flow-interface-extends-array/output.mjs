import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
interface StringList extends Array<string> {}
function foo(arr: StringList) {
  for (const x of arr) {
    x.at(-1);
  }
}