import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an array wrapper of arity > 1 may be crossed on the walk to the destructure host; usage-global
// only adds imports, so both the consumed leaf and the unconsumed sibling stay verbatim
const [{
  Array: {
    from
  }
}, other] = [globalThis, 1];
const [second, {
  Map: {
    groupBy
  }
}] = [2, globalThis];
console.log(other, second, from, groupBy);