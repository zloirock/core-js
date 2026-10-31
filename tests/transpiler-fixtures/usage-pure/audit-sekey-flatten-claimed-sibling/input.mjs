// A nested static declarator and a computed-key instance declarator keep their source slots.
// Each key precedes its selected method read, and later siblings see the completed bindings,
// in either declarator order and in a for-init header.
let k1 = 0;
var { Array: { from: f1 } } = globalThis, { [(k1++, 'at')]: a1, other1 } = Array.prototype;
export const r1 = [typeof f1, typeof a1, k1];
// The same rule holds when the computed-key declarator precedes the nested static.
let k2 = 0;
var { [(k2++, 'flat')]: fl2, other2 } = Array.prototype, { Array: { of: o2 } } = globalThis;
export const r2 = [typeof fl2, typeof o2, k2];
// A for-init header keeps the key and instance binding before later declarators.
let k3 = 0, out3 = '';
for (var { Array: { isArray: ia3 } } = globalThis, { [(k3++, 'includes')]: inc3, o3 } = Array.prototype, i3 = 0; i3 < 1; i3++) {
  out3 = [typeof ia3, typeof inc3].join(',');
}
export const r3 = [out3, k3];
// A computed static key also runs before its selected binding and ordinary sibling read.
let k4 = 0;
var { Array: { from: f4 } } = globalThis, { [(k4++, 'of')]: of4, other4 } = Array;
export const r4 = [typeof f4, typeof of4, k4];
// A bodyless declaration keeps both computed keys and their method reads inside the condition,
// with one receiver evaluation and source order preserved.
let k5 = 0, j5 = 0;
if (1) var { Array: { keys: ks5 } } = globalThis, { [(k5++, 'at')]: a5, [(j5++, 'flat')]: b5, other5 } = Array.prototype;
export const r5 = [typeof ks5, typeof a5, typeof b5, k5, j5];
