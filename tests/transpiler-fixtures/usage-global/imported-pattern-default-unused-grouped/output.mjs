import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An imported level default already owns these retained reads.
// Reprocessing without a neighbouring extraction keeps the pattern and its rest intact.
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _Set
} = _globalThis;
export { grouped };