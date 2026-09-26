// A non-bare optional root feeds two non-optional polyfilled hops, so the inner hop reuses the
// memoized root via a guardRef needle. The needle's boundary check reads the char after the root
// spelling; a valid connector may carry a comment or whitespace before `?.`, so a bare index would
// see the gap, decide the needle has no root boundary, skip the guardRef candidate, and then the
// needle fails to locate in the outer content - throwing on the whole file. The read must skip the gap.
const a = { b: { c: [[1], [2]] } };
a.b /* keep me */ ?.c.slice(1).flat(2);

// A gap on BOTH connectors, and one trailing the leaf: every boundary read the needle machinery
// does must skip the gap, including the end-of-needle case where only a comment follows the root.
const t = { u: { v: [[3], [4]] } };
t.u /* one */ ?.v /* two */ .slice(0) /* three */ .flat(1);

// A line-terminator gap is a gap too (a prettier rewrap of a minified chain).
const w = { q: { r: [[5]] } };
w.q
  ?.r.slice(0).flat(1);

// A gap TRAILING the last hop only: the boundary reads before `?.` see no gap here, and the
// end-of-chain comment must neither confuse the needle nor survive into a wrong slot.
const p = { q: { r: [[5], [6]] } };
p.q?.r.slice(1).flat(0) /* tail */;

// The root itself is parenthesized with an inner trailing comment: the memoized value is the
// paren expression, and the comment stays inside the memo assignment.
const s = { t: { u: [[7]] } };
(s.t /* in */)?.u.slice(0).flatMap(v => v);

// A ternary CONSUMES the guarded chain: the root-boundary gate accepts the chain inside the
// test position, and the guard-memo wraps only the chain, not the branches.
const k = { l: [[8]] };
export const viaTernary = k.l?.flat(0) ? k.l.flat(1) : null;

