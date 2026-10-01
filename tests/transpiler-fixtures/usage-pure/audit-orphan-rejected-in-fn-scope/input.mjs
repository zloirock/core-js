// nested-scope `_ref = X` is user code regardless of RHS shape - plugin emits orphan
// assignments only at module top-level. user-shape assignment inside a function body
// must NOT be adopted as orphan; the user's intent (write to a global) wins
function helper() {
  null == (_ref = window.payload) ? void 0 : _ref;
}
const arr = [1, 2, 3];
arr.includes(2);
helper();
