// a constructor written through an alias of a parameter keeps its statics - the namespace entry: the alias
// writes into the object a caller passes, as a write spelled through the parameter does. The namesakes handed
// out beside them change no entry; that they share no slot writes shows where an entry can tell it, in
// `namesake-locals-share-no-slot-writes` and the usage-global twin
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
function installDirect(box) {
  const slot = box;
  slot.value = Promise;
}
function exposeDirect(box) {
  hand(box);
}
