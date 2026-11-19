import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an object-pattern key naming an array index reads the slot under the positional contract: past
// a leading spread every static element is a possible value, the same maybe-union the positional
// spelling enumerates, so both spellings of one read inject the static the runtime may reach
// one static per row, so every row is observable by its own module
const {
  1: viaKeyed
} = [...rest, Map];
export const a = viaKeyed.groupBy(src, x => x);
const [, viaPositional] = [...rest, Object];
export const b = viaPositional.fromEntries(src);