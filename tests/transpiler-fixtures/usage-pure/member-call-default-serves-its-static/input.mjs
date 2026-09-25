// a default spelled as a member off a CALL (`= g().M`) serves the static read through it, running the
// call only where the default fires, as the flat read `g().M.groupBy` does - computed, top-level, and
// through a name the call's value was stored under
function g() { log(); return { M: Map, P: Promise, O: Object }; }
function h1(o) { const { A: { groupBy: s } = g().M } = o; return s; }
const { A: { try: t } = g().P } = {};
function h3(o) { const { A: { fromEntries: e } = g()['O'] } = o; return e; }
const G = g();
function h4(o) { const { A: { withResolvers: w } = G.P } = o; return w; }
use(h1, t, h3, h4);
