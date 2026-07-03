// a flatten-claimed declaration re-renders whole-range from per-declarator slots, so a sibling
// SE-key instance destructure must route its artifacts through the SAME slots: the value rename
// bakes into the residual slice, the receiver memo joins the slot extractions (before the
// residual), and the extracted pair trails the WHOLE declaration (after every declarator - the
// trailing-sibling canon; the kept key effect runs first) - in EITHER declarator order, and in
// a for-init head
let k1 = 0;
var { Array: { from: f1 } } = globalThis, { [(k1++, 'at')]: a1, other1 } = Array.prototype;
export const r1 = [typeof f1, typeof a1, k1];
// SE-key declarator BEFORE the flatten declarator (the claim lands after the artifacts queue)
let k2 = 0;
var { [(k2++, 'flat')]: fl2, other2 } = Array.prototype, { Array: { of: o2 } } = globalThis;
export const r2 = [typeof fl2, typeof o2, k2];
// for-init head: the pair joins the comma list after the residual
let k3 = 0, out3 = '';
for (var { Array: { isArray: ia3 } } = globalThis, { [(k3++, 'includes')]: inc3, o3 } = Array.prototype, i3 = 0; i3 < 1; i3++) {
  out3 = [typeof ia3, typeof inc3].join(',');
}
export const r3 = [out3, k3];
// static SE-key sibling control (no memo channel involved)
let k4 = 0;
var { Array: { from: f4 } } = globalThis, { [(k4++, 'of')]: of4, other4 } = Array;
export const r4 = [typeof f4, typeof of4, k4];
// bodyless control host wraps in a block; TWO SE-key props share the slot (one memo, two
// renames, two trailing pairs - key effects in source order)
let k5 = 0, j5 = 0;
if (1) var { Array: { keys: ks5 } } = globalThis, { [(k5++, 'at')]: a5, [(j5++, 'flat')]: b5, other5 } = Array.prototype;
export const r5 = [typeof ks5, typeof a5, typeof b5, k5, j5];
