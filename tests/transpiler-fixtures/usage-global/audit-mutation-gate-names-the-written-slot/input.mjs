// the point query behind a TYPING answer owes every name the scoped pass could attribute. this
// write replaces the whole `Array` global one hop through the global object, and there the
// namespace is spelled in the WRITTEN KEY - nowhere else in the target's chain. so the known
// narrow on `Array.from` drops and the `.at` dispatch widens to the whole family
const xs = [];
window.Array = patch;
Array.from(xs).at(0);
