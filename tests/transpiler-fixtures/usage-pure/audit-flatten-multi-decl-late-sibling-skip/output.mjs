import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// Sibling declarator is visited before the second declarator triggers a flatten. The
// sibling's `Set` reference emits a `Set -> _Set` substitution and import before the
// outer flatten registers its whole-VariableDeclaration overwrite. The inner edit now
// sits inside the outer edit range. If the two are not composed, either the inner
// substitution silently disappears from the final emit (leaving a runtime ReferenceError
// against unpolyfilled `Set`) or the bundler aborts on overlapping edits.
const sib = _Set;
const from = _Array$from;
console.log(sib, from);