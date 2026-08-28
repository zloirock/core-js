// a REST sibling takes back the host level's exemption: the emptied hop normally prunes out of the
// residual, which is why a claim beside a host sibling owns the hop's only read - but rest gathers
// whatever the pattern did not name, so the hop has to STAY there keeping its key excluded. what
// leaves instead is the hop's VALUE: it takes a minted binding, the dispatch reads that name, and
// the source's single read stands - the array element's own answer, one dialect over
const box = { keep: 7 };
Object.defineProperty(box, 'inner', {
  get() { box.reads = (box.reads ?? 0) + 1; return [1, [2]]; },
  enumerable: true,
});
const withRest = (function () {
  const { inner: { flat }, ...rest } = box;
  return [flat, rest.keep];
})();
// ... and the plain host sibling beside it is the control the rule is carved out of: no rest, the
// hop prunes, and the claim extracts off the single read
const withoutRest = (function () {
  const { inner: { flat }, keep } = box;
  return [flat, keep];
})();
// ... and in an ASSIGNMENT host under a wrapper there is no declaration to mint the pair into, so
// the rest above the hop keeps the claim native: the hop's key stays in the pattern, and that key
// IS the second read the dispatch would add
let assignedFlat, assignedRest;
[{ inner: { flat: assignedFlat }, ...assignedRest }] = [box];
export { withRest, withoutRest, assignedFlat, assignedRest };
