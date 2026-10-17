// A gap on BOTH connectors, and one trailing the leaf: every boundary read the needle machinery
// does must skip the gap, including the end-of-needle case where only a comment follows the root.
const t = { u: { v: [[3], [4]] } };
t.u /* one */ ?.v /* two */ .slice(0) /* three */ .flat(1);
