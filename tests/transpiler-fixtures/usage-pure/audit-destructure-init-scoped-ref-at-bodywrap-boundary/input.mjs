// scopedVar insertPos lands at block.start + 1 (the `var _ref;` anchor immediately after
// `{`). that position is INCLUSIVE in bodyContains() since both bodyWrap's body.start and
// the scopedVar's insertPos can coincide for tight nested-block shapes. pins inclusive
// containment - exclusive `>` would drop the scopedVar at the boundary, leaving _ref
// undeclared after the bodyWrap overwrite
const { from } = ((() => {var x = [1, 2, 3].at(0); return Array;})(), Array);
console.log(from);
