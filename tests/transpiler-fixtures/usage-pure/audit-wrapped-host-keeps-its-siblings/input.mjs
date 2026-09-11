// the hop normalization REPLACES the host pattern with the leaf, so the host may hold nothing but
// the hop: a sibling beside it binds a value that replacement drops, and the emitted code then
// reads a name nothing declares. under an array WRAPPER the host is the ELEMENT that pairs with
// the literal, and the rule is the same one the flat spelling already asked of its declarator
const nested = { lead: 5, y: Object.assign([1, [2]], { extra: 7 }), top: 4 };
// NEGATIVE: siblings on BOTH sides of the hop - the shape keeps its own destructure
const [{ lead, y: { flat, extra }, top }] = [nested];
// NEGATIVE: a sibling only AFTER the hop
const [{ y: { flat: flatA, extra: extraA }, top: topA }] = [nested];
// NEGATIVE: a sibling only BEFORE it
const [{ lead: leadB, y: { flat: flatB, extra: extraB } }] = [nested];
// ... and the SOLE-hop host still normalizes: the element takes the nav, the pattern the leaf
const [{ y: { flat: flatSole, extra: extraSole } }] = [nested];
export { lead, flat, extra, top, flatA, extraA, topA, leadB, flatB, extraB, flatSole, extraSole };
