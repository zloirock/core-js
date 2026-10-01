// SE-bearing IIFE under a member hop (`[(IIFE)().Array]`): same harvest contract - the
// re-emitted setup keeps its inner globalThis rewrite + import
let calls = 0;
const [{
  from
}] = [(() => {
  calls++;
  return globalThis;
})().Array];
