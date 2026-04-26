// destructuring assignment with a call expression on the RHS: existing bindings are
// reused for the rewrite; subsequent instance calls still polyfill in pure-mode.
let x;
[x] = getArray();
x.at(0);
