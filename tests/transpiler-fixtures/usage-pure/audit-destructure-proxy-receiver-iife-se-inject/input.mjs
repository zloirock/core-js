// SE-bearing IIFE as the proxy-global HOST of a nested destructure (`[{ Array: { from } }]`):
// harvested the same way through the array-wrapper descent
let calls = 0;
const [{
  Array: {
    from
  }
}] = [(() => {
  calls++;
  return globalThis;
})()];
