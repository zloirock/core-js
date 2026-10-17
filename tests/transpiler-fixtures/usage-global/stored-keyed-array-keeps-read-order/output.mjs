import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored array is reachable while a preceding element's method getter runs.
// Keep iteration native so that getter can change the following position.
export let stored;
export function keyed(input) {
  const {
    w: [{
      at
    }, tail]
  } = {
    w: stored = [input, 0]
  };
  return [at, tail, stored];
}
export function nested(input) {
  const [{
    w: [{
      includes
    }, tail]
  }] = [{
    w: stored = [input, 0]
  }];
  return [includes, tail, stored];
}