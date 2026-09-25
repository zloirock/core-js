// a LOGICAL fallback receiver read by an instance member AND a static: the static's per-branch
// mirror is planted before the instance claim memoizes the receiver, so the static binds its
// polyfill off the fallback arm in either order the pattern names the two, on either host; a key
// that is a static of the fallback's constructor AND an instance method branches on the arm, and
// statics around the instance member read it the way a direct read of the constructor does. the
// mirror's instance slot dispatches off the constructor (`name: _nameMaybeFunction(_Map)`): the
// claim reads that slot back, and a raw `_Map.name` is undefined where the engine lacks `name`
let nm, s;
({ name: nm, groupBy: s } = (globalThis.zz || Map));
const { name: nm2, try: t } = (null ?? Promise);
const { from: f, name: nm3 } = (globalThis.yy || Iterator);
const { name: nm4, entries: e4 } = (globalThis.xx || Object);
const { from: a5, name: nm5, of: b5 } = (globalThis.ww || Array);
use(nm, s, nm2, t, f, nm3, nm4, e4, a5, nm5, b5);
