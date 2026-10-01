// nested object destructure from an SE-bearing IIFE host: usage-global injects for the resolved
// constructor key while keeping the runtime shape untouched
let calls = 0;
const {
  Array: {
    from
  }
} = (() => {
  calls++;
  return globalThis;
})();
