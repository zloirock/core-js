import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// an effect buried in a transparent single-element array wrapper must survive every
// discard-and-rebuild host: the consumed wrapper drops, the effect lifts / re-embeds in
// source order (a top-level-only sequence peel dropped it with the discarded init)
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);

// for-init full consume: the whole init collapses into the discard sink
let out1;
for (const _unused = (eff('a'), _globalThis), from = _Array$from; !out1;) out1 = from;
let out2;
for (const [{
  Array: {
    of
  },
  ...rest2
}] = [(eff('b'), _globalThis)]; !out2;) out2 = of;

// assignment-cascade partial consume: the swapped element loses its buried prefix, so
// the host lifts it as a standalone statement, running exactly once
let fa;
let rest3;
[{
  Array: {
    fromAsync: fa
  },
  ...rest3
}] = [(eff('c'), _globalThis)];

// a polyfilled call INSIDE the lifted prefix keeps its own substitution (the skip seed
// leaves the lifted subtree live for the natural visitor)
const w = "abc";
eff(_atMaybeString(w).call(w, -1));
const groupBy = _Map$groupBy;
export { out1, out2, fa, rest3, groupBy, seen };

// an SE-bearing TRAILING init element is evaluated-then-discarded at runtime, and it still runs:
// the consumed wrapper drops, the buried prefix and the trailing neighbour lift as statements in
// source order ahead of the extraction - both legs, one spelling
eff('e');
eff('f');
const fromEntries = _Object$fromEntries; // a PURE trailing extra is value-dead - the level still peels and the extraction proceeds
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
const entries = _Object$entries; // an INLINE SE-bearing extra ABOVE a dereferenced element lifts like any inline neighbour: the
// alias's declaration is foreign (other readers observe it) and keeps its literal untouched,
// while the inline level drops and re-emits its own effect ahead of the extraction
const w3 = [_globalThis];
eff('m');
const hasOwn = _Object$hasOwn;
export { ownKeys, entries, hasOwn };