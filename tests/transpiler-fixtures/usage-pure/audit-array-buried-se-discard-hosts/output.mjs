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
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an effect buried in a transparent single-element array wrapper must survive every
// discard-and-rebuild host: the consumed wrapper drops, the effect lifts / re-embeds in
// source order (a top-level-only sequence peel dropped it with the discarded init)
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);

// for-init full consume: the whole init collapses into the discard sink
let out1;
for (const from = _Array$from, _unused = (eff('a'), _globalThis); !out1;) out1 = from;

// for-init partial consume: the rest sibling keeps the rebuilt wrapper; the buried
// prefix re-embeds around it, running exactly once
let out2;
for (const of = _Array$of, [{
    Array: _unused2,
    ...rest2
  }] = [(eff('b'), _globalThis)]; !out2;) out2 = of;

// assignment-cascade partial consume: the swapped element loses its buried prefix, so
// the host lifts it as a standalone statement, running exactly once
let fa;
let rest3;
var _unused3;
[{
  Array: _unused3,
  ...rest3
}] = [(eff('c'), _globalThis)];

// a polyfilled call INSIDE the lifted prefix keeps its own substitution (the skip seed
// leaves the lifted subtree live for the natural visitor)
fa = _Array$fromAsync;
const w = "abc";
eff(_atMaybeString(w).call(w, -1));
const groupBy = _Map$groupBy;
export { out1, out2, fa, rest3, groupBy, seen };

// an SE-bearing TRAILING init element is evaluated-then-discarded at runtime: consuming the
// wrapper level would drop that effect, so the peel bails and the whole init stays verbatim
// (bail-safe: no extraction, native reads keep every effect)
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
eff('g');
const allSettled = _Promise$allSettled;
export { fromEntries, allSettled };

// a DEREFERENCED alias wrapper is exempt from the trailing-extra bail: the alias's own
// declaration keeps the whole array (only the value flows into the destructure), so the
// extraction proceeds and both effects run exactly once at the alias declaration
const wrap = [(eff('h'), _globalThis), eff('i')];
const ownKeys = _Reflect$ownKeys; // levels BELOW the dereference are exempt too (sticky): the whole nested array lives in the
// alias's declaration, so the inner trailing effect stays there and the extraction proceeds
const wrap2 = [[(eff('j'), _globalThis), eff('k')]];
const entries = _Object$entries; // an INLINE SE-bearing extra ABOVE a dereferenced element declines every rewrite that would
// leave the host (the alias's declaration is foreign - other readers observe it); the leaf
// falls to the inline-default fallback ON the host, and both effects stay verbatim
const w3 = [_globalThis];
const [[{
  Object: {
    hasOwn = _Object$hasOwn
  }
}]] = [w3, eff('m')];
export { ownKeys, entries, hasOwn };