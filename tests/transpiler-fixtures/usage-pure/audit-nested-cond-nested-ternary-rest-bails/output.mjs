import _globalThis from "@core-js/pure/actual/global-this";
// the user object hides one level deeper - inside the INNER ternary's alternate. the proxy-branch
// classifier must recurse through the nested conditional, not just inspect the outer branches: the
// inner alternate `userObj` is a reachable value branch lacking `from`, so an un-mirrorable inner
// rest must bail to native (a per-branch default would fire on that branch's legitimate `undefined`).
// locks that the recursion reaches arbitrarily nested conditional branches, not only the top level
const userObj = {
  Array: {}
};
const {
  Array: {
    from,
    ...rest
  }
} = outer ? inner ? _globalThis : userObj : _globalThis;
typeof from;