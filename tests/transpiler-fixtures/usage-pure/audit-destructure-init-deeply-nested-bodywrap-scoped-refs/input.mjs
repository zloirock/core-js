// THREE-LEVEL nesting: outer arrow body-wrap contains middle arrow body-wrap which contains
// inner block scopedVar. each level absorbs its OWN direct scopedVars and direct child wraps;
// inner block's scopedVar passes through to its own enclosing wrap's recursive compose, not
// landing at the outer level. pins the recursive directScopedVars filter that excludes
// scopedVars inside a nested wrap (they would otherwise double-emit at outer level)
const { from } = ((() => (
  (() => (
    ((() => { var z = [1].at(0); return z; })(), [2].at(0))
  ))()
    + [3].at(0)
))(), Array);
console.log(from);
