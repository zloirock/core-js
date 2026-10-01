// user code with `_ref = ...` as default export expression. plugin must NOT misclassify
// this as a plugin-shaped orphan-ref assignment and adopt the name - the user's `_ref`
// binding stays distinct, plugin allocates `_ref2` for its own memo
var _ref;
export default _ref = [1, 2, 3].at(0);
