// A named factory retains the ordinary indirect-call extraction.
// It is not classified as a transparent literal wrapper.
function make() { return { C: Map };
} const { C: { groupBy } } = make();
export const r = typeof groupBy;
