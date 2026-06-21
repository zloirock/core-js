// Sibling declarator is visited before the second declarator triggers a flatten, so its
// `Set -> _Set` substitution is queued before the outer flatten registers its whole-
// VariableDeclaration overwrite - the inner edit now sits inside the outer edit range.
// If the two are not composed, either the inner substitution silently disappears (runtime
// ReferenceError against unpolyfilled `Set`) or the bundler aborts on overlapping edits.
const sib = Set, { Array: { from } } = globalThis;
console.log(sib, from);
