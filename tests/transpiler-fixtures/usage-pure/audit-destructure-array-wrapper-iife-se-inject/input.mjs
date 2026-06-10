// an SE-bearing IIFE leaf in an array-wrapper destructure: the flatten harvests the discarded
// init's chain-root call and re-emits it ahead of the extraction - the setup runs once, in
// native order, and the binding still gets the polyfill (polyfill-wins on targets without it)
let calls = 0;
const [{
  from
}] = [(() => {
  calls++;
  return Array;
})()];
