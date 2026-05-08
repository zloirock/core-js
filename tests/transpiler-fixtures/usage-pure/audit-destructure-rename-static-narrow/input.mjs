// destructure with rename `const { from: customFrom } = Array` must still narrow the
// call's return through the renamed local. distinct methods (at, findLast) confirm the
// narrowing applies at each call site, not just the first
const { from: customFrom } = Array;
const arr = customFrom('xy');
arr.at(0);
arr.findLast(x => x);
