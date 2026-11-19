// the slot-rename route needs a BINDING SITE for the minted name, not a declaration, and these two
// hosts have one: an ASSIGNMENT host takes a hoisted `var` and writes the claim's binding right after
// its statement; an EXPORTED host binding MORE than the claim drops its wrapper - the extraction
// carries the export the source wrote and the SIBLING names keep theirs through a specifier list, so
// the minted name is the one thing that never leaves the module
const rows = [[1, [2]], [3]];
const assigned = (function () {
  let at;
  ([{ at }] = rows);
  return at;
})();
export const [{ at: exportedMulti }, alsoExported] = rows;
// ... and the element the pattern pairs with may be a side-effect-free MEMBER: the residual dies, so
// the dispatch is the only read of it and spelling it once costs nothing
const memberElement = (function () {
  let at;
  ([{ at }] = [rows[0]]);
  return at;
})();
export { assigned, memberElement };
