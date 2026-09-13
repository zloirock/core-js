import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Array slots preserve known constructors read through the global object.
// Plain and optional navigation both resolve; each static has its own import.
const arraySlot = [globalThis.Array];
export const viaPlain = arraySlot[0].of(1);
const mapSlot = [globalThis?.Map];
export const viaOptional = mapSlot[0].groupBy([], value => value);