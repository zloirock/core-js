import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a constructor core-js defines no module for stays the engine's own, so handing it to code this file
// does not see - a call, an export, a realm slot, a return - loads none of its static or prototype
// modules: those load where a read names them. a constructor core-js polyfills, handed out the same
// way, still loads its whole family
hand(String);
export const list = Array;
globalThis.slot = Object;
export function math() {
  return Math;
}
hand(Map);