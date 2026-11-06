import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Defined constructor and static ponyfills make these source defaults unreachable at every
// depth: under an object hop, under an array wrapper, and beside a sibling.
function defaultKeepsGuard() {
  const {
    w: {
      Map: dfMap = null
    },
    z
  } = {
    w: globalThis,
    z: 1
  };
  const {
    Array: {
      from: dfFrom = null
    }
  } = globalThis;
  const [{
    of: dfOf = null
  }, y] = [Array, 2];
  const {
    w: {
      Array: {
        from: dfDeep = null
      }
    }
  } = {
    w: globalThis
  };
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}
export default [defaultKeepsGuard()];