import _at from "@core-js/pure/actual/instance/at";
var _ref;
// preceding-block-assignment scan returns the first matching sibling assignment but
// did not validate intermediate siblings for conditional reassignment. with the bug:
// the unconditional `f = X` two siblings back is treated as the value at the use site,
// even though the intermediate `if (cond) f = Y` may have rebound `f` to a different
// shape. expected: bail to declared type / generic polyfill since both X and Y are
// reachable at the use site
let f;
f = {
  data: [1, 2, 3]
};
if (Math.random() > 0.5) f = {
  data: 'string'
};
_at(_ref = f.data).call(_ref, -1);