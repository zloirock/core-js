// for-init multi-declarator flatten: the destructure declarator gets fully consumed and
// synthesized to `_unused = (sePrefix, tail)` while a sibling `idx` declarator keeps its
// own init. flushPendingFlatten drains scope-tracker per declarator independently and
// attaches drainedRefs to each entry; the synth declarator bakes refs into its seSrc, the
// sibling declarator stays untouched. distinct method (`Array.from` static-extract vs
// `.values` instance polyfill in the SE-prefix arrow) keeps both branches observable.
for (let idx = 0, { Array: { from } } = ((() => [].values())(), globalThis); idx < 1; idx++) from([idx]);
