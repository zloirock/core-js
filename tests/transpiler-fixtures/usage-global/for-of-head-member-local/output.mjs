import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop writing a local member does not hand its constructor to an outside reader.
// Only the static read after the loop needs coverage.
function use() {
  const box = {};
  for (box.value of [Array]) {}
  box.value.of(3);
}
use();