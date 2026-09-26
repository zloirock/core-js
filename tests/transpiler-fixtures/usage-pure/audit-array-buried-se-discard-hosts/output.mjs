import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref3, _ref4, _ref5, _ref6, _unused2;
// Effects inside array wrappers survive static extraction and residual capture.
// Each initializer keeps its effects in source order and runs once.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);

// for-init full consume: the whole init collapses into the discard sink
let out1;
for (const [{
  Array: {
    from
  }
}] = [(eff('a'), {
  Array: {
    from: _Array$from
  }
})]; !out1;) out1 = from;
let out2;
for (const [_ref] = [(eff('b'), _globalThis)], _ref2 = _ref, _ref8 = _ref2["Array"], of = _Array$of, {
    Array: _unused,
    ...rest2
  } = _ref2; !out2;) out2 = of;

// assignment-cascade partial consume: the swapped element loses its buried prefix, so
// the host lifts it as a standalone statement, running exactly once
let fa;
let rest3;
[_ref3] = _ref4 = [(eff('c'), _globalThis)], _ref5 = _ref3, _ref6 = _ref5["Array"], fa = _Array$fromAsync, _ref6, {
  Array: _unused2,
  ...rest3
} = _ref5, _ref5, _ref4;

// a polyfilled call INSIDE the lifted prefix keeps its own substitution (the skip seed
// leaves the lifted subtree live for the natural visitor)
const w = "abc";
const [{
  Map: {
    groupBy
  }
}] = [(eff(_atMaybeString(w).call(w, -1)), {
  Map: {
    groupBy: _Map$groupBy
  }
})];
export { out1, out2, fa, rest3, groupBy, seen };

// an SE-bearing TRAILING init element is evaluated-then-discarded at runtime, and it still runs:
// the consumed wrapper drops, the buried prefix and the trailing neighbour lift as statements in
// source order ahead of the extraction - both legs, one spelling
const [{
  Object: {
    fromEntries
  }
}] = [(eff('e'), {
  Object: {
    fromEntries: _Object$fromEntries
  }
}), eff('f')];

// a PURE trailing extra is value-dead - the level still peels and the extraction proceeds
const [{
  Promise: {
    allSettled
  }
}] = [(eff('g'), {
  Promise: {
    allSettled: _Promise$allSettled
  }
}), 7];
export { fromEntries, allSettled };

// a DEREFERENCED alias wrapper is exempt from the trailing-extra bail: the alias's own
// declaration keeps the whole array (only the value flows into the destructure), so the
// extraction proceeds and both effects run exactly once at the alias declaration
const wrap = [(eff('h'), _globalThis), eff('i')];
const [_ref7] = wrap;

// levels BELOW the dereference are exempt too (sticky): the whole nested array lives in the
// alias's declaration, so the inner trailing effect stays there and the extraction proceeds
const {
  ownKeys: _unused3
} = _Reflect;
const ownKeys = _Reflect$ownKeys;
const wrap2 = [[(eff('j'), _globalThis), eff('k')]];
const [[{
  Object: {
    entries: _unused4
  }
}]] = wrap2;
const entries = _Object$entries;

// An inline trailing effect stays in the native initializer ahead of both array iterations.
// The alias keeps its own literal; the native static read precedes the pure binding.
const w3 = [_globalThis];
const [[{
  Object: {
    hasOwn: _unused5
  }
}]] = [w3, eff('m')];
const hasOwn = _Object$hasOwn;
export { ownKeys, entries, hasOwn };