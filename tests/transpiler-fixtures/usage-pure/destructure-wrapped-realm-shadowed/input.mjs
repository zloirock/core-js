// A transparent wrapper does not turn a user binding into the global realm.
// Preserve supplied instance slots and the throw when the receiver is null.
function read(globalThis: any) {
  const { w: { Array: { prototype: { at, flat } } } } = { w: globalThis! };
  return [at, flat];
}
use(read({ Array: { prototype: { at: 19, flat: 23 } } }));
