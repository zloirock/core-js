import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A named callee that returns its parameter inside a container literal yields that container per
// call, so a static read through the slot lands on the argument and injects that static alone.
// The argument stays home: reached by name, inline, stored, or through a tag alike.
function box(v) {
  return [v];
}
function wrap(s, v) {
  return {
    held: v
  };
}
const held = box(Array);
export const direct = box(Array)[0].of(1);
export const stored = held[0].from([1]);
export const inline = function (v) {
  return {
    at: v
  };
}(Object).at.groupBy([1], x => x);
export const tagged = wrap`${Map}`.held.groupBy([1], x => x);