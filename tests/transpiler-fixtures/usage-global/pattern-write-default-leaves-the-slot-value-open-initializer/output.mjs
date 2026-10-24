import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
export function initializer() {
  let list = [3, 4];
  const settled = ({
    a: list = 'ab'[Symbol.iterator]()
  } = {
    a: undefined
  }, 0);
  return [settled, list.map(x => x)];
}