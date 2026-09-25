import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Only bindings a plain alias ties share their slot writes: namesakes in other functions do not,
// so handing out an unrelated parameter hands out nothing written through another function's alias.
function pass(item) {
  const held = item;
  return held;
}
function install(held) {
  const slot = held;
  slot.value = Map;
}
function expose(item) {
  hand(item);
}
// ... and namesake PARAMETERS a plain alias ties within each function: a parameter records no value,
// yet its declaration still makes it a binding of its own
function installDirect(box) {
  const slot = box;
  slot.value = Promise;
}
function exposeDirect(box) {
  hand(box);
}