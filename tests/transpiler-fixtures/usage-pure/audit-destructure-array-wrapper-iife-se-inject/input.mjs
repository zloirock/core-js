// An effectful IIFE under an array wrapper runs once and supplies the pure static.
let calls = 0;
const [{
  from
}] = [(() => {
  calls++;
  return Array;
})()];
