import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
// a LOGICAL fallback receiver read by an instance member AND a static: the static's per-branch
// mirror is planted before the instance claim memoizes the receiver, so the static binds its
// polyfill off the fallback arm in either order the pattern names the two, on either host; a key
// that is a static of the fallback's constructor AND an instance method branches on the arm, and
// statics around the instance member read it the way a direct read of the constructor does. the
// mirror's instance slot dispatches off the constructor (`name: _nameMaybeFunction(_Map)`): the
// claim reads that slot back, and a raw `_Map.name` is undefined where the engine lacks `name`
let nm, s;
({
  name: nm,
  groupBy: s
} = globalThis.zz || Map);
const {
  name: nm2,
  try: t
} = null ?? Promise;
const {
  from: f,
  name: nm3
} = globalThis.yy || Iterator;
const {
  name: nm4,
  entries: e4
} = globalThis.xx || Object;
const {
  from: a5,
  name: nm5,
  of: b5
} = globalThis.ww || Array;
use(nm, s, nm2, t, f, nm3, nm4, e4, a5, nm5, b5);