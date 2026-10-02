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
// A throw in a nested function belongs to its call execution, outside the surrounding catch.
// Its thrown container escapes and keeps positional dispatch generic.
const rows = [[1, 2]];
try {
  function f() {
    throw rows;
  }
  use(f);
} catch (e) {}
const [{
  at
}] = rows;
use(at);