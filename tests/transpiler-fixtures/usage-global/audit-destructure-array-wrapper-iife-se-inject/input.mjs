// usage-global keeps the destructure text verbatim (the IIFE setup runs as written), so the
// resolved leaf still must INJECT es.array.from - an SE gate on the shared classification would
// under-inject and `from` would be undefined on targets without the static
let calls = 0;
const [{
  from
}] = [(() => {
  calls++;
  return Array;
})()];
