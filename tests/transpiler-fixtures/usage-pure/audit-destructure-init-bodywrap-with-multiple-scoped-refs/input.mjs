// Outer arrow body-wrap must absorb two scoped `var _ref;` inserts coming from two
// sibling inner instance-method polyfills. The two inserts target different offsets
// inside the wrapped slice; if their splice order does not stay stable as the slice
// grows, the second insert lands at a shifted offset and silently corrupts the wrapped
// expression - producing syntactically invalid code at runtime.
const { from } = ((() => (
  ((() => { var z1 = [1].at(0); return z1; })(), [2].at(0))
    + ((() => { var z2 = [3].at(0); return z2; })(), [4].at(0))
))(), Array);
console.log(from);
