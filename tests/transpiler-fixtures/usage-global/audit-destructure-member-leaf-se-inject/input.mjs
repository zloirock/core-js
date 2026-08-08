// same injection contract for an SE-bearing IIFE under a member hop: classification resolves the
// leaf through the inline call, the import lands, the text stays verbatim
let calls = 0;
const [{
  from
}] = [(() => {
  calls++;
  return globalThis;
})().Array];
