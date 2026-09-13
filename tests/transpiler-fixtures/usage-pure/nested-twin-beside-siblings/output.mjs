import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref17;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = {
  y: [1]
};
const deep = {
  y: {
    z: [1]
  }
};
const c = 1;
const {
  junk: j1
} = Array;
const _ref = _Array$of;
const hopFirst = _nameMaybeFunction(_ref);
const {
  foo: f1
} = _ref;
const {
  junk: j2
} = Array;
const _ref2 = _Array$of;
const hopLast = _nameMaybeFunction(_ref2);
const {
  foo: f2
} = _ref2;
const F1 = _Array$from;
const {
  isArray: I1
} = Array;
const _ref3 = _Array$of;
const hopMiddle = _nameMaybeFunction(_ref3);
const {
  foo: f3
} = _ref3;
const F2 = _Array$from;
const _ref4 = _Array$of;
const hopAfterStatic = _nameMaybeFunction(_ref4);
const {
  foo: f4
} = _ref4;
const F3 = _Array$from;
const _ref5 = _Array$of;
const hopBeforeStatic = _nameMaybeFunction(_ref5);
const {
  foo: f5
} = _ref5;
const {
  of: {
    name: hopRest,
    ...r1
  },
  junk: j4
} = Array;
const {
  junk: j5
} = _globalThis.Array;
const _ref6 = _Array$of;
const viaProxyInner = _nameMaybeFunction(_ref6);
const {
  foo: f7
} = _ref6;
const {
  junk: j6
} = _globalThis.Array;
const _ref7 = _Array$of;
const viaProxyInnerLast = _nameMaybeFunction(_ref7);
const {
  foo: f8
} = _ref7;
const {
  Array: {
    junk: j7
  },
  more: m1
} = _globalThis;
const _ref8 = _Array$of;
const viaProxyTwoLevels = _nameMaybeFunction(_ref8);
const {
  foo: f9
} = _ref8;
const {
  junk: j8
} = _globalThis;
const _ref9 = _Array$of;
const viaProxyHostSibling = _nameMaybeFunction(_ref9);
const {
  foo: f10
} = _ref9;
const K1 = _Object$keys;
const _ref10 = _Array$of;
const viaProxyCtorSibling = _nameMaybeFunction(_ref10);
const {
  foo: f11
} = _ref10;
const {
  junk: j9
} = _globalThis.Array;
const _ref11 = _Array$of;
const viaProxyNav = _nameMaybeFunction(_ref11);
const {
  foo: f12
} = _ref11;
const _ref12 = box;
const _ref13 = _ref12.y;
const userFirst = _atMaybeArray(_ref13);
const {
  other: o1
} = _ref13;
const {
  junk: j10
} = _ref12;
const _ref14 = box;
const {
  junk: j11
} = _ref14;
const _ref15 = _ref14.y;
const userLast = _atMaybeArray(_ref15);
const {
  other: o2
} = _ref15;
const _ref16 = box;
const {
  junk: j12
} = _ref16;
const _ref18 = (_ref17 = _ref16.y) === void 0 ? [] : _ref17;
const userDefault = _atMaybeArray(_ref18);
const {
  other: o3
} = _ref18;
const _ref19 = box;
const {
  junk: j13
} = _ref19;
const _ref20 = _ref19.y;
const userMiddle = _atMaybeArray(_ref20);
const {
  other: o4
} = _ref20;
const {
  more: m2
} = _ref19;
const {
  y: {
    z: {
      at: userDeep,
      other: o5
    },
    junk: j14
  }
} = deep;
// A single consumed leaf leaves unrelated properties in the residual pattern.
const F4 = _Array$from;
const soleBesideStatic = _nameMaybeFunction(_Array$of);
const soleBesideJunk = _nameMaybeFunction(_Array$of);
const {
  junk: j21
} = Array;
const soleBesideNavJunk = _nameMaybeFunction(_Array$of);
const {
  junk: j22
} = _globalThis.Array;
const soleBesideHostJunk = _nameMaybeFunction(_Array$of);
const {
  junk: j23
} = _globalThis;
const _ref21 = box;
const soleUserBesideJunk = _atMaybeArray(_ref21.y);
const {
  junk: j25
} = _ref21;
const {
  junk: j15
} = Array;
const _ref22 = _Array$of;
const viaLet = _nameMaybeFunction(_ref22);
const {
  foo: f13
} = _ref22;
const {
    of: {
      name: viaLeadingDeclarator,
      foo: f14
    },
    junk: j16
  } = Array,
  z1 = 1;
const z2 = 1,
  {
    junk: j17
  } = Array;
const _ref23 = _Array$of;
const viaTrailingDeclarator = _nameMaybeFunction(_ref23);
const {
  foo: f15
} = _ref23;
for (const {
  of: {
    name: viaForInit,
    foo: f16
  },
  junk: j18
} = Array;;) {
  [viaForInit, f16, j18];
  break;
}
if (c) var {
  of: {
    name: viaBodyless,
    foo: f17
  },
  junk: j19
} = Array;
export const {
  of: {
    name: viaExport,
    foo: f18
  },
  junk: j20
} = Array;
export { hopFirst, f1, j1, j2, hopLast, f2, F1, hopMiddle, f3, I1, F2, hopAfterStatic, f4, hopBeforeStatic, f5, F3, hopRest, r1, j4, viaProxyInner, f7, j5, j6, viaProxyInnerLast, f8, viaProxyTwoLevels, f9, j7, m1, viaProxyHostSibling, f10, j8, viaProxyCtorSibling, f11, K1, viaProxyNav, f12, j9, userFirst, o1, j10, j11, userLast, o2, j12, userDefault, o3, j13, userMiddle, o4, m2, userDeep, o5, j14, j15, viaLet, f13, viaLeadingDeclarator, f14, j16, z1, z2, viaTrailingDeclarator, f15, j17, viaBodyless, f17, j19, F4, soleBesideStatic, soleBesideJunk, j21, soleBesideNavJunk, j22, soleBesideHostJunk, j23, soleUserBesideJunk, j25 };