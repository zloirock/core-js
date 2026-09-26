// Native captures preserve the bindings beside a nested hop.
// A shared receiver is read once before its leaf properties; unsupported hosts stay native.
const nested = { lead: 5, y: Object.assign([1, [2]], { extra: 7 }), top: 4 };
// Siblings on both sides keep their reads around the nested hop.
const [{ lead, y: { flat, extra }, top }] = [nested];
// A following sibling retains its native read after the captured nested properties.
const [{ y: { flat: flatA, extra: extraA }, top: topA }] = [nested];
// A preceding sibling reads before the nested hop.
const [{ lead: leadB, y: { flat: flatB, extra: extraB } }] = [nested];
// ... and the SOLE-hop host still normalizes: the element takes the nav, the pattern the leaf
const [{ y: { flat: flatSole, extra: extraSole } }] = [nested];
export { lead, flat, extra, top, flatA, extraA, topA, leadB, flatB, extraB, flatSole, extraSole };
