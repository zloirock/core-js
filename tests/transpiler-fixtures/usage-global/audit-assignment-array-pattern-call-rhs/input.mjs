// destructuring assignment with a call expression on the RHS: the existing binding `x`
// is reused for the rewrite; subsequent `x.at(0)` instance call still polyfills.
let x;
[x] = getArray();
x.at(0);
