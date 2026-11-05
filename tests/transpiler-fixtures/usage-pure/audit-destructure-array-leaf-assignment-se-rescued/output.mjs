// An assignment in an array element preserves both its store and IIFE effects.
// The wrapper and static from read remain native.
let calls = 0;
let a;
const [{
  from
}] = [a = (() => {
  calls++;
  return Array;
})()];