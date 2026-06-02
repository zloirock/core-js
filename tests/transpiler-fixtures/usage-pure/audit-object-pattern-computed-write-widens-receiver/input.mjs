// `({ x: o[k] } = v)` is an ObjectPattern destructuring WRITE through a dynamic computed key, which
// could touch any field of `o`, so `o.val` widens and `.at` gets the generic polyfill. Contrast the
// object-literal read `{ x: o[k] }`, which keeps `o.val` typed as `number[]`.
const o = { val: [1, 2, 3] };
const k = "p";
let v: any;
({ x: o[k] } = v);
o.val.at(0);
