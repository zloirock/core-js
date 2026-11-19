import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A bound literal wrapper keeps native statics after an earlier statement.
for (const row of [{
  C: Object
}]) {
  effect();
  const {
    C: {
      keys
    }
  } = row;
  use(keys);
}