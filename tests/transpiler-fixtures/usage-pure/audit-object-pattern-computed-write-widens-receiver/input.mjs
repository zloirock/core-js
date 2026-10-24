// A destructuring write through a constant computed key names a different field.
// The array receiver stays narrow; an unknown key would keep the generic fallback.
const o = { val: [1, 2, 3] };
const k = "p";
let v: any;
({ x: o[k] } = v);
o.val.at(0);
