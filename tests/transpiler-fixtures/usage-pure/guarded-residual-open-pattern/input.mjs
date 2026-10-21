// A partial pattern keeps its guarded native receiver for the unresolved sibling.
// The array static remains served when the optional realm is present.
function read({ of, length } = globalThis.window?.self.Array) {
  return [of(effect()), length];
}
read();
