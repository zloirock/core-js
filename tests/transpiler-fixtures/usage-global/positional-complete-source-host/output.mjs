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
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// One positional plan retains native iteration and emits all selected reads in source order.
export function nested(rows) {
  const [[{
    at
  }],, [{
    includes
  }], ...tail] = rows;
  return [at, includes, tail];
}
export function header(rows) {
  for (const [{
    at
  }, {
    includes
  }] = rows;;) return [at, includes];
}
export function bodyless(rows) {
  if (rows) var [{
    at
  }, {
    includes
  }] = rows;
  return [at, includes];
}