import _at from "@core-js/pure/actual/instance/at";
var _ref;
// the preceding-assignment scan picks the first matching sibling but must also reject
// intermediate conditional reassignment. with the bug the unconditional `f = X` two siblings
// back is read as the value at the use site even though `if (cond) f = Y` between them may
// rebind `f` to a different shape. expected: bail to the declared type / generic polyfill
// since both X and Y are reachable at the use site
let f;
f = {
  data: [1, 2, 3]
};
if (Math.random() > 0.5) f = {
  data: 'string'
};
_at(_ref = f.data).call(_ref, -1);