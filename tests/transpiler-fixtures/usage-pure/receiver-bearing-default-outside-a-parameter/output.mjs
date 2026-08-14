import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Set from "@core-js/pure/actual/set/constructor";
import _String$raw from "@core-js/pure/actual/string/raw";
// a nested default that CARRIES the receiver: the outer slot is unknown, so what runs when it is
// undefined IS the default - and a mirror of that default fires under exactly the same condition,
// which makes it correct on every host, not only in a parameter list. one static per host so a
// dropped host is visible in the import set. the last three are controls: a proxy-global receiver
// still resolves through the OUTER chain and flattens, a default carrying no receiver stays native,
// and a resolvable outer chain leaves its dead default alone
const src = {};
const flag = true;
const list = [];
function use() {/* empty */}
function raise() {/* empty */}
const {
  a: {
    from
  } = {
    from: _Array$from
  }
} = src;
let entries;
({
  b: {
    entries
  } = {
    entries: _Object$entries
  }
} = src);
try {
  raise();
} catch ({
  c: {
    allSettled
  } = {
    allSettled: _Promise$allSettled
  }
}) {
  use(allSettled);
}
for (const {
  d: {
    isFinite
  } = {
    isFinite: _Number$isFinite
  }
} of list) use(isFinite);
const {
  e: {
    f: {
      groupBy
    } = {
      groupBy: _Map$groupBy
    }
  }
} = src;
export const {
  g: {
    raw
  } = {
    raw: _String$raw
  }
} = src;
const of = _Array$of;
const {
  h: {
    plain
  } = {}
} = src;
const {
  union
} = _Set;
// a BRANCHY default declines: this channel answers with a receiver NAME, and a name cannot say
// "either branch" - mirroring one of them would emit the wrong branch's static whenever the other
// fires. the flat twin affords these shapes only because its meta carries a fallback flag
const {
  b1: {
    from: fromOr
  } = Array || _Iterator
} = src;
const {
  b2: {
    from: fromTernary
  } = flag ? Array : _Iterator
} = src;
// the same rule on an INSTANCE receiver: the default is the receiver, so the mirror carries the
// bound helper and the caller's own object still destructures natively. the last row is the
// control - a receiver the shared shape gate rejects (a call, which re-evaluating would repeat)
// keeps the whole form native
const {
  i1: {
    flat
  } = {
    flat: _flatMaybeArray(list)
  }
} = src;
function withDefault({
  i2: {
    includes
  } = {
    includes: _includesMaybeArray(list)
  }
} = {}) {
  return includes;
}
const {
  i3: {
    at
  } = raise()
} = src;
use(from, entries, of, plain, union, groupBy, flat, at, withDefault(), fromOr, fromTernary);