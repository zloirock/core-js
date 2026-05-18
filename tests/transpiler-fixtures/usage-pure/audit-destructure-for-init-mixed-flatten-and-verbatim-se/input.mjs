// for-init multi-decl: one flatten declarator (`{Array:{from}} = (a(), globalThis)`) AND
// one non-flatten sibling with its own SE init (`b = (sideEffect(), 1)`). the flatten
// declarator's SE must re-embed into the synth sink; the sibling's SE must remain verbatim
// via `nodeSrc` - `injectForInitSESinks` gates on `extractions.length` so it doesn't
// double-rewrite a non-flatten sibling that just happens to have a SequenceExpression init
declare const a: () => void;
declare const sideEffect: () => number;
for (const { Array: { from } } = (a(), globalThis), b = (sideEffect(), 1); false; ) {
  console.log(from, b);
}
