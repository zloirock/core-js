// `_ref` introduced via object destructure: legitimate user binding.
// Plugin scope-aware allocator must skip past it on its own ref allocation.
// `_ref2` introduced as array-destructure binding tests the same path
// but for a separate slot
const obj = { _ref: 10 };
const { _ref } = obj;
const [, _ref2] = [0, 1];
const arr = [1, 2, 3];
arr.at(_ref);
arr.findLast(x => x > _ref2);
