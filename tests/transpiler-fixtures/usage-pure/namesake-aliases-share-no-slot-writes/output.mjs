import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Only bindings a plain alias ties share their slot writes: namesakes in other functions do not,
// so handing out an unrelated parameter hands out nothing written through another function's alias.
function pass(item) {
  const held = item;
  return held;
}
function install(held) {
  const slot = held;
  slot.value = _Map;
}
function expose(item) {
  hand(item);
}
// ... and namesake PARAMETERS a plain alias ties within each function: a parameter records no value,
// yet its declaration still makes it a binding of its own
function installDirect(box) {
  const slot = box;
  slot.value = _Promise;
}
function exposeDirect(box) {
  hand(box);
}