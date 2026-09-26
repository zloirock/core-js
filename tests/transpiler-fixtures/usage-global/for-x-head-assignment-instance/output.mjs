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
// Assignment heads keep writing their original targets on every iteration.
let at;
for ({
  at
} of [[1, 2], [3, 4]]) consume(at);
consume(at);
const target = {};
outer: for ({
  at: target.method
} of [[5, 6]]) {
  consume(target.method);
  continue outer;
}
for ({
  at
} of unknownRows) consume(at);