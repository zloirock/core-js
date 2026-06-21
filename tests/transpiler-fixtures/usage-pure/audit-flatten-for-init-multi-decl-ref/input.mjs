// for-init multi-declarator flatten: the destructure declarator is fully consumed and
// rewritten into a synthesized `_unused = (SE-prefix, tail)` sink while a sibling `idx`
// declarator keeps its own init. The SE-prefix arrow needs a `var _ref;` binding for
// `[].values()`; that binding belongs to the synth declarator only. If the binding
// leaks into the sibling, the for-init emits a duplicate or misplaced `_ref` and the
// loop fails at runtime. Distinct methods on each side keep both branches observable.
for (let idx = 0, { Array: { from } } = ((() => [].values())(), globalThis); idx < 1; idx++) from([idx]);
