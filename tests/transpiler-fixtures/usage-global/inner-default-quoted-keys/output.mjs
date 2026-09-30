import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-symbols";
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
// A quoted sibling and rest leave reachable claims in the receiver default visible.
// User leaf defaults and the supplied receiver retain their independent meanings.
// Global presence guard; the companion pure fixture locks the receiver rewrites.
let of, dash, fromEntries, rest;
[{
  Array: {
    of
  },
  'with-dash': dash
} = globalThis] = [];
[{
  Object: {
    fromEntries
  },
  ...rest
} = globalThis] = [];
export function read(source) {
  const [{
    Map: {
      groupBy = 1
    },
    '[key]': raw = 2
  } = globalThis] = source;
  return [groupBy, raw];
}