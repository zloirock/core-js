// nested object destructure (no array wrapper) from an SE-bearing IIFE host: the nested
// resolver classifies through the inline call and the flatten re-emits the harvested setup
let calls = 0;
const {
  Array: {
    from
  }
} = (() => {
  calls++;
  return globalThis;
})();
