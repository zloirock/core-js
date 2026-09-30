import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A method getter precedes later plain or rest binding writes.
// Earlier bindings stay native; each later binding uses its selected array value.
function read(rows) {
  let tail = 'old';
  let at;
  [{
    at
  }, tail] = rows;
  return [at, tail];
}
function rest(rows) {
  const [{
    includes
  }, ...tail] = rows;
  return [includes, tail];
}
use(read, rest);