// only bindings a plain alias ties share their slot writes: a constructor written through an alias of a local
// container keeps its own entry when a namesake of that container's binding, tied to a parameter in another
// function, is handed out in a third
function pass(item) {
  const held = item;
  return held;
}
function install() {
  const held = {};
  const slot = held;
  slot.value = Map;
}
function expose(item) {
  hand(item);
}
