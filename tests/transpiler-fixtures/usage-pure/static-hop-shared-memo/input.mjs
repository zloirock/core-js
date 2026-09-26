// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const c = 1;
function eff() {}
const { of: { name: viaFlat, foo: f1 } } = Array;
const { of: { name: viaDefault, foo: f2 } = {} } = Array;
const [{ of: { name: viaWrapped, foo: f3 } }] = [Array];
const [{ of: { name: viaWrappedDefault, foo: f4 } = {} }] = [Array];
const [{ of: { name: viaWrappedSibling, foo: f5 } }, z1] = [Array, 1];
const [z2, { of: { name: viaWrappedBehindEffect, foo: f6 } }] = [eff(), Array];
for (const { of: { name: viaForInit, foo: f7 } } = Array; ;) { [viaForInit, f7]; break; }
if (c) var { of: { name: viaBodyless, foo: f8 } } = Array;
const { of: { name: viaLeadingDeclarator, foo: f9 } } = Array, z3 = 1;
const z4 = 1, { of: { name: viaTrailingDeclarator, foo: f10 } = {} } = Array;
const { Array: { of: { name: viaHop, foo: f11 } = {} } } = globalThis;
const { of: { name: viaRest, ...r1 } } = Array;
const { of: { name: viaLength, length: l1 } = {} } = Array;
const { of: { name: viaSole } } = Array;
export {
  viaFlat, f1, viaDefault, f2, viaWrapped, f3, viaWrappedDefault, f4, viaWrappedSibling, f5, z1, z2,
  viaWrappedBehindEffect, f6, viaBodyless, f8, viaLeadingDeclarator, f9, z3, z4, viaTrailingDeclarator, f10,
  viaHop, f11, viaRest, r1, viaLength, l1, viaSole,
};
