import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _entries from "@core-js/pure/actual/instance/entries";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a LOGICAL fallback receiver read by an instance member AND a static: the static's per-branch
// mirror is planted before the instance claim memoizes the receiver, so the static binds its
// polyfill off the fallback arm in either order the pattern names the two, on either host; a key
// that is a static of the fallback's constructor AND an instance method branches on the arm, and
// statics around the instance member read it the way a direct read of the constructor does. the
// mirror's instance slot dispatches off the constructor (`name: _nameMaybeFunction(_Map)`): the
// claim reads that slot back, and a raw `_Map.name` is undefined where the engine lacks `name`
let nm, s;
const _ref = _globalThis.zz || {
  name: _nameMaybeFunction(_Map),
  groupBy: _Map$groupBy
};
nm = _nameMaybeFunction(_ref);
({
  groupBy: s
} = _ref);
const _ref2 = null ?? {
  name: _nameMaybeFunction(_Promise),
  try: _Promise$try
};
const nm2 = _nameMaybeFunction(_ref2);
const {
  try: t
} = _ref2;
const _ref3 = _globalThis.yy || {
  from: _Iterator$from,
  name: _nameMaybeFunction(_Iterator)
};
const nm3 = _nameMaybeFunction(_ref3);
const {
  from: f
} = _ref3;
const _ref4 = _globalThis.xx || Object;
const nm4 = _nameMaybeFunction(_ref4);
const e4 = _ref4 === Object ? _Object$entries : _entries(_ref4);
const _ref5 = _globalThis.ww || {
  from: _Array$from,
  name: _nameMaybeFunction(Array),
  of: _Array$of
};
const nm5 = _nameMaybeFunction(_ref5);
const {
  from: a5,
  of: b5
} = _ref5;
use(nm, s, nm2, t, f, nm3, nm4, e4, a5, nm5, b5);