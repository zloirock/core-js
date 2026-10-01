// a missing-able-ctor residual re-anchors to the pure constructor AND keeps a polyfillable default
// nested in a residual leaf: the receiver swap never answered for `nested: { customA = [1].at(0) }`,
// so the render owes it its visibility - one binding re-homes the pattern in place and the value stays
// the live node it was, the other clones and rescues that subtree from its skip seeding. A TOP-LEVEL
// residual default still bails the anchor: the two bindings split on whether they re-visit it, which
// is a binding fact and not the plan's to decide.
const { Array: { from }, Set: { union, nested: { customA = [1].at(0) } } } = globalThis;
export { from, union, customA };
