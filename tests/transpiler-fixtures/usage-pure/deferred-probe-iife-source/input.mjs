// The receiver's call stays live until its nested claim has been rewritten.
// Its result is observed once before both keys are extracted.
function read({ of, from } = ((() => {
  [7].at(0);
  return globalThis.window;
})()?.self).Array) {
  return [of(3), from([4])];
}
read();
