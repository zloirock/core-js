// a DEFAULTED leaf in an assignment host is flat like its undefaulted twin: the default costs a
// guard, not a route, and the consume spells the receiver once whether or not it is re-readable
const arr = [1, 2];
const nb = { y: arr };
let m1, m2, m3, m4, m5, restOf, m6, m7, n7, m8, m9, m10, x;
({ at: m1 = 1 } = [1, 2]);
// the same leaf in the two sequence positions: a discarded non-tail element and a tail one
(({ at: m2 = 1 } = [1, 2]), x);
(x, ({ at: m3 = 1 } = [1, 2]));
// a PATTERN default consumes too - the left becomes the extraction's own target, and it may
// spell whatever a pattern spells: a rest, a leaf default, a surviving sibling prop
({ at: { 0: m4 } = [9] } = arr);
({ at: { 0: m5, ...restOf } = [9] } = arr);
({ at: { 0: m6 = 7 } = [9] } = arr);
({ at: { 0: m7 } = [9], includes: n7 } = arr);
// ... but a leaf carrying a claim of its OWN keeps the mirror: that claim is the composition's,
// and consuming here would render the receiver twice
({ y: { flat: m8 } = [] } = nb);
// the composed two-step in this host: a TYPED outer hop feeds the leaf dispatch, whether the hop
// is an instance method or a static of the constructor the receiver names
({ flat: { at: m9 } = [] } = arr);
({ from: { name: m10 } = {} } = Array);
export { m1, m2, m3, m4, m5, restOf, m6, m7, n7, m8, m9, m10 };
