// an unbraced `var` whose nested leaf flattens keeps every other declarator of that `var`: the
// flattened pair joins the declarator list in place, beside a sibling another route rewrote first,
// and each of two flattened declarators reads its own memo
const box = { y: [1, [2]] };
if (box) var q = 1, { y: { at: afterSibling, flat: afterSiblingFlat } } = box;
if (box) var { from: staticFirst } = Array, { y: { flatMap: afterStatic, includes: afterStaticFlat } } = box;
if (box) var { y: { findLast: one, findLastIndex: oneFlat } } = box, { y: { toSorted: two, toReversed: twoFlat } } = box;
export { q, afterSibling, afterSiblingFlat, staticFirst, afterStatic, afterStaticFlat, one, oneFlat, two, twoFlat };
