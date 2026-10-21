// A consumed pattern retains the sealed receiver read in its default slot.
// An explicit argument bypasses that slot, including its source exception.
function read({ of } = (globalThis.window?.self).Array) {
  return of(effect());
}
read();
read({ of: value => [value] });
