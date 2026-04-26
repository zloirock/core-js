import _at from "@core-js/pure/actual/instance/at";
// destructuring assignment with a call expression on the RHS: existing bindings are
// reused for the rewrite; subsequent instance calls still polyfill in pure-mode.
let x;
[x] = getArray();
_at(x).call(x, 0);