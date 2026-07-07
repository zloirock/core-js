import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
const from = _Array$from;
// a flatten whose residual keeps a REBUILT pattern re-emits the init: the detect pass
// suppressed the natural visitor on the init's proxy globals (expecting the emit to own
// them), so the re-emitted tail must route through the same init-globals resolver the flat
// route uses - a raw `globalThis` here is a ReferenceError on engines without the global
const {
  deep: {
    other
  }
} = _globalThis.Array;
use(from, other);

// each operand of a LOGICAL init substitutes the same way in the rebuilt residual
const of = _Array$of;
const {
  nested: {
    more
  }
} = _globalThis.Array || Fallback;
use(of, more);

// a symbol-iterator-keyed sibling rides the same rebuilt re-emit; the polyfillable default
// inside its value stays live and the init still substitutes
const {
  isArray,
  [_Symbol$iterator]: {
    x = _atMaybeArray(_ref = [1]).call(_ref, 0)
  }
} = _globalThis.Array;
use(isArray, x);

// the for-init host cannot lift the SE prefix (loop header forbids statements): the sink
// re-embeds `(SE, <tail>)`, and the tail must own the same substitution
for (const ff = _Array$from, {
    deep: {
      other: oo
    }
  } = (eff(), _globalThis.Array); cond;) {
  use(ff, oo);
}

// controls: a pure-ctor leaf whole-swaps; a const-alias root keeps the user identifier
const groupBy = _Map$groupBy;
const {
  deeper: {
    rest
  }
} = _Map;
use(groupBy, rest);
const g = _globalThis;
const k = _Object$keys;
const {
  wrapped: {
    last
  }
} = g.Object;
use(k, last);