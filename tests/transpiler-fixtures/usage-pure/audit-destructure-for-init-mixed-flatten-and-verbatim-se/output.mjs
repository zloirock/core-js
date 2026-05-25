import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init multi-decl: one flatten declarator (`{Array:{from}} = (a(), globalThis)`) AND
// one non-flatten sibling with its own SE init (`b = (sideEffect(), 1)`). the flatten
// declarator's SE must re-embed into the synth sink; the sibling's SE must remain verbatim
// via `original-source slice` - `for-init SE-sink injection` gates on `extractions.length` so it doesn't
// double-rewrite a non-flatten sibling that just happens to have a SequenceExpression init
declare const a: () => void;
declare const sideEffect: () => number;
for (const from = _Array$from, _unused = (a(), _globalThis), b = (sideEffect(), 1); false;) {
  console.log(from, b);
}