import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// sibling declarator visited BEFORE flatten triggers. natural Identifier visitor fires on
// the sibling's `Set` reference FIRST and emits a `Set -> _Set` substitution + import
// (range INSIDE the eventual flatten overwrite). then flatten triggers on the second
// declarator's `from` and registers a host-level overwrite of the WHOLE VariableDeclaration.
// `polyfillSiblingReceiverRefs` doesn't track `Set` (it walks only `flattenedReceivers`,
// here just `globalThis`). the late `skippedNodes.add` for the sibling's matches would
// seem too late - but transform-queue's compose mechanism (`#applyComposed`) detects the
// nested inner transform and substitutes `Set -> _Set` INTO the outer flatten's rebuilt
// content via needle matching. import is not dead - both polyfills land in the final emit.
// confirms compose handles the late-seed timing correctly without needing eager
// skippedNodes seeding
const sib = _Set;
const from = _Array$from;
console.log(sib, from);