import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function foo(items) {
  for (const x of items) {
    if (typeof x === 'number') {
      console.log('skipping');
      continue;
    }
    x.at(0);
  }
}