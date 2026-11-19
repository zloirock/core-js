// An iterator claim keyed by an effect beside a plain slot, in a for-init over a realm selection.
// The key runs before the claim, and both legs reuse the immutable pure realm import without a copy.
for (const { [(e(), Symbol.iterator)]: it, z } = c ? globalThis : self; ;) break;
