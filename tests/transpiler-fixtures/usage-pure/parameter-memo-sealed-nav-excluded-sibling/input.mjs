// An excluded sibling keeps the receiver memo, including its sealed navigation.
// The inner instance claim stays live and the receiver call runs once.
function read({ of, from } = ((() => {
  [7].at(0);
  return globalThis.window;
})()?.self).Array) {
  return [of(3), from([4])];
}
read();
