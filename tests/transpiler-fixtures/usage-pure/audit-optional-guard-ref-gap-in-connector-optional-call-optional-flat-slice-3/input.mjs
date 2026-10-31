// A line-terminator gap is a gap too (a prettier rewrap of a minified chain).
const w = { q: { r: [[5]] } };
w.q
  ?.r.slice(0).flat(1);
