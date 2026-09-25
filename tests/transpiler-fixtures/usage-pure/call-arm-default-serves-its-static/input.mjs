// a DEFAULT selecting between a CALL and a constructor (`= f() || Set`) serves the static read through
// it off the call's value when that value can never be falsy, and runs the call only where the default
// fires - a nested level, a nullish selection, a top-level host, behind a sequence, and a parameter
function f() { log(); return Map; }
function g() { log(); return Promise; }
function k() { log(); return Iterator; }
function m() { log(); return Object; }
function h1(o) { const { M: { groupBy: s } = f() || Set } = o; return s; }
function h2(o) { const { P: { try: t } = g() ?? Set } = o; return t; }
const { I: { from: i3 } = k() || Set } = {};
function h4(o) { const { O: { fromEntries: e } = (n++, m()) || Set } = o; return e; }
function h5({ P: { withResolvers: w } = g() || Set } = {}) { return w; }
function h6({ concat: c } = k() || Set) { return c; }
use(h1, h2, i3, h4, h5, h6);
