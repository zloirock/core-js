// Each key of the default receiver uses its own pure static. Accepting the first
// key must leave the source receiver available to the remaining keys.
function read({ of, from } = (globalThis.window?.self).Array) {
  return [of(3), from([4])];
}
read();
