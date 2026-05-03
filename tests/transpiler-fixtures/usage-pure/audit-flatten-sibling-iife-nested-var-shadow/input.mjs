const { Array: { from } } = globalThis, val = (function () {
  if (true) {
    var globalThis = 'shadow';
  }
  return globalThis;
})();
console.log(from, val);
