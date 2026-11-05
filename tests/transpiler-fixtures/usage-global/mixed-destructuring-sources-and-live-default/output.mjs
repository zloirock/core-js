import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A literal owns its native slot. The realm and each live default can be served independently.
export function run(user) {
  const seen = [];
  for (const {
    Array: {
      of
    }
  } of [globalThis, {
    Array: user
  }]) seen.push(typeof of);
  const [{
    MissingObject: {
      fromEntries
    } = Object
  }] = [globalThis];
  return [seen, fromEntries([['value', 7]])];
}
export function select(flag) {
  const {
    C: {
      groupBy
    }
  } = flag ? {
    C: Map
  } : {
    C: Object
  };
  return groupBy;
}