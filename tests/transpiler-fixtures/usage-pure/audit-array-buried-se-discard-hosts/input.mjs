// an effect buried in a transparent single-element array wrapper must survive every
// discard-and-rebuild host: the consumed wrapper drops, the effect lifts / re-embeds in
// source order (a top-level-only sequence peel dropped it with the discarded init)
const seen = [];
const eff = t => (seen.push(t), t);

// for-init full consume: the whole init collapses into the discard sink
let out1;
for (const [{ Array: { from } }] = [(eff('a'), globalThis)]; !out1;) out1 = from;

// for-init partial consume: the rest sibling keeps the rebuilt wrapper; the buried
// prefix re-embeds around it, running exactly once
let out2;
for (const [{ Array: { of }, ...rest2 }] = [(eff('b'), globalThis)]; !out2;) out2 = of;

// assignment-cascade partial consume: the swapped element loses its buried prefix, so
// the host lifts it as a standalone statement, running exactly once
let fa;
let rest3;
([{ Array: { fromAsync: fa }, ...rest3 }] = [(eff('c'), globalThis)]);

// a polyfilled call INSIDE the lifted prefix keeps its own substitution (the skip seed
// leaves the lifted subtree live for the natural visitor)
const w = "abc";
const [{ Map: { groupBy } }] = [(eff(w.at(-1)), globalThis)];

export { out1, out2, fa, rest3, groupBy, seen };

// an SE-bearing TRAILING init element is evaluated-then-discarded at runtime: consuming the
// wrapper level would drop that effect, so the peel bails and the whole init stays verbatim
// (bail-safe: no extraction, native reads keep every effect)
const [{ Object: { fromEntries } }] = [(eff('e'), globalThis), eff('f')];

// a PURE trailing extra is value-dead - the level still peels and the extraction proceeds
const [{ Promise: { allSettled } }] = [(eff('g'), globalThis), 7];

export { fromEntries, allSettled };

// a DEREFERENCED alias wrapper is exempt from the trailing-extra bail: the alias's own
// declaration keeps the whole array (only the value flows into the destructure), so the
// extraction proceeds and both effects run exactly once at the alias declaration
const wrap = [(eff('h'), globalThis), eff('i')];
const [{ Reflect: { ownKeys } }] = wrap;

// levels BELOW the dereference are exempt too (sticky): the whole nested array lives in the
// alias's declaration, so the inner trailing effect stays there and the extraction proceeds
const wrap2 = [[(eff('j'), globalThis), eff('k')]];
const [[{ Object: { entries } }]] = wrap2;

// an INLINE SE-bearing extra ABOVE a dereferenced element declines every rewrite that would
// leave the host (the alias's declaration is foreign - other readers observe it); the leaf
// falls to the inline-default fallback ON the host, and both effects stay verbatim
const w3 = [globalThis];
const [[{ Object: { hasOwn } }]] = [w3, eff('m')];

export { ownKeys, entries, hasOwn };
