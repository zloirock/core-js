import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Native positional reads remain between the surrounding declarator evaluations.
export function read(rows) {
  const beforeInit = before(),
    [{
      first,
      value: {
        other,
        at
      },
      last
    }] = rows,
    afterInit = after();
  return [beforeInit, first, other, at, last, afterInit];
}