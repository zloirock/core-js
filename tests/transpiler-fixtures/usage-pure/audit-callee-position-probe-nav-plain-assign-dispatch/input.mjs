// a NON-optional dispatch over the same root: the `?.` on the assign carrier is dead text (the
// write always yields the global), and only one emitter drops it - a spelling split the sidecar
// records, both reading the same value through the same guard
let heldPlainDispatch;
export const plainAssignDispatch = (heldPlainDispatch = globalThis)?.window?.self.unknownCalleeBox.list.at(0);
export { heldPlainDispatch };
