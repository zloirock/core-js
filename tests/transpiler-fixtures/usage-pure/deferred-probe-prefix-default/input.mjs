// The default's prefix keeps its nested claims and runs once before the sealed
// read. Passing an argument bypasses both the prefix and the default receiver.
function read({ of, from } = ([7].at(0), (globalThis.window?.self).Array)) {
  return [of(3), from([4])];
}
read();
read({ of: value => [value], from: value => value });
