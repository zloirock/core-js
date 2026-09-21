import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref2;
// a flatten whose residual keeps a REBUILT pattern re-emits the init: the detect pass
// suppressed the natural visitor on the init's proxy globals (expecting the emit to own
// them), so the re-emitted tail must route through the same init-globals resolver the flat
// route uses - a raw `globalThis` here is a ReferenceError on engines without the global
const {
  from,
  deep: {
    other
  }
} = {
  from: _Array$from,
  deep: Array.deep
};
use(from, other);

// each operand of a LOGICAL init substitutes the same way in the rebuilt residual
const {
  of,
  nested: {
    more
  }
} = {
  of: _Array$of,
  nested: Array.nested
};
use(of, more);

// a symbol-iterator-keyed PATTERN sibling extracts through the helper off the shared memo
// (the init substitutes into the memo); the polyfillable default inside the pattern stays live
const _ref = _globalThis.Array,
  {
    isArray
  } = _ref,
  {
    x = _atMaybeArray(_ref2 = [1]).call(_ref2, 0)
  } = null == _ref ? _ref[""] : _getIteratorMethod(_ref);
use(isArray, x);

// the for-init host cannot lift the SE prefix (loop header forbids statements): the sink
// re-embeds `(SE, <tail>)`, and the tail must own the same substitution
for (const {
  from: ff,
  deep: {
    other: oo
  }
} = (eff(), {
  from: _Array$from,
  deep: Array.deep
}); cond;) {
  use(ff, oo);
}

// controls: a pure-ctor leaf whole-swaps; a const-alias root keeps the user identifier
const {
  groupBy,
  deeper: {
    rest
  }
} = {
  groupBy: _Map$groupBy,
  deeper: _Map.deeper
};
use(groupBy, rest);
const g = _globalThis;
const {
  keys: k,
  wrapped: {
    last
  }
} = {
  keys: _Object$keys,
  wrapped: Object.wrapped
};
use(k, last);