// NEGATIVE: an array-wrapper host the shared array plan declines keeps its native pattern on both
// legs - a static beside an unknown key, or reached through an opaque element, stays unextracted
// even where the same leaf without the wrapper extracts (the flat rows below)
const e = [{ w: Array }];
let kx = String('zz');
const [{ of: wrappedOf, [kx]: wrappedUnknown }] = [Array];
let assignedOf, assignedFrom;
[{ w: { of: assignedOf, from: assignedFrom } }] = [e[0]];
const { of: flatOf, [kx]: flatUnknown } = Array;
const { w: { from: flatFrom } } = e[0];
export { wrappedOf, wrappedUnknown, assignedOf, assignedFrom, flatOf, flatUnknown, flatFrom };
