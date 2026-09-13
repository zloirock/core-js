import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const c = 1;
function eff() {}
const _ref = _Array$of;
const viaFlat = _nameMaybeFunction(_ref);
const {
  foo: f1
} = _ref;
const _ref2 = _Array$of;
const viaDefault = _nameMaybeFunction(_ref2);
const {
  foo: f2
} = _ref2;
const _ref3 = _Array$of;
const viaWrapped = _nameMaybeFunction(_ref3);
const [{
  foo: f3
}] = [_ref3];
const _ref4 = _Array$of;
const viaWrappedDefault = _nameMaybeFunction(_ref4);
const [{
  foo: f4
}] = [_ref4];
const _ref5 = _Array$of;
const viaWrappedSibling = _nameMaybeFunction(_ref5);
const [{
  foo: f5
}, z1] = [_ref5, 1];
const [z2, {}] = [eff(), Array];
const _ref6 = _Array$of;
const viaWrappedBehindEffect = _nameMaybeFunction(_ref6);
const {
  foo: f6
} = _ref6;
for (const _ref7 = _Array$of, viaForInit = _nameMaybeFunction(_ref7), {
    foo: f7
  } = _ref7;;) {
  [viaForInit, f7];
  break;
}
if (c) var _ref8 = _Array$of,
  viaBodyless = _nameMaybeFunction(_ref8),
  {
    foo: f8
  } = _ref8;
const _ref9 = _Array$of;
const viaLeadingDeclarator = _nameMaybeFunction(_ref9);
const {
  foo: f9
} = _ref9;
const z3 = 1;
const z4 = 1;
const _ref10 = _Array$of;
const viaTrailingDeclarator = _nameMaybeFunction(_ref10);
const {
  foo: f10
} = _ref10;
const _ref11 = _Array$of;
const viaHop = _nameMaybeFunction(_ref11);
const {
  foo: f11
} = _ref11;
const {
  of: {
    name: viaRest,
    ...r1
  }
} = Array;
const _ref12 = _Array$of;
const viaLength = _nameMaybeFunction(_ref12);
const {
  length: l1
} = _ref12;
const viaSole = _nameMaybeFunction(_Array$of);
export { viaFlat, f1, viaDefault, f2, viaWrapped, f3, viaWrappedDefault, f4, viaWrappedSibling, f5, z1, z2, viaWrappedBehindEffect, f6, viaBodyless, f8, viaLeadingDeclarator, f9, z3, z4, viaTrailingDeclarator, f10, viaHop, f11, viaRest, r1, viaLength, l1, viaSole };