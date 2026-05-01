// `_ref += ...` is user-shaped (orphan adoption only matches simple `_ref = expr`).
// Plugin must reserve and let user code keep its semantics. Tests that compound
// assign-form is NOT mistakenly adopted as plugin-emitted reuse-the-receiver shape
let _ref = 0;
_ref += 5;
_ref *= 2;
const arr = [1, 2, 3];
arr.at(0);
arr.findLast(x => x > _ref);
