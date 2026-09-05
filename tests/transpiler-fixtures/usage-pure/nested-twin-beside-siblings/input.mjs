// a hop whose level keeps SIBLINGS leaves it for a twin of its own (`hopSplitPlan`): the pair - the
// memo of the hop and the claims off it - stands beside the host, which goes on binding its siblings
// off the root. a built-in root (a constructor, the realm, a nav into it) re-reads for free and its
// reads are unobservable, so the pair stands behind the host whatever the hop's position or level;
// a USER root re-reads for free at the host level only, keeping the source's order: the hop stands
// at an end, the pair ahead of the host where the hop led. a host that empties goes. declined where
// the pair has no statement slot of its own (a loop head, a bodyless slot, an export, a declarator
// that is not the last) and for a user root's hop below the host or in the middle
const box = { y: [1] };
const deep = { y: { z: [1] } };
const c = 1;
const { of: { name: hopFirst, foo: f1 }, junk: j1 } = Array;
const { junk: j2, of: { name: hopLast, foo: f2 } } = Array;
const { from: F1, of: { name: hopMiddle, foo: f3 }, isArray: I1 } = Array;
const { from: F2, of: { name: hopAfterStatic, foo: f4 } } = Array;
const { of: { name: hopBeforeStatic, foo: f5 }, from: F3 } = Array;
const { of: { name: hopRest, ...r1 }, junk: j4 } = Array;
const { Array: { of: { name: viaProxyInner, foo: f7 }, junk: j5 } } = globalThis;
const { Array: { junk: j6, of: { name: viaProxyInnerLast, foo: f8 } } } = globalThis;
const { Array: { of: { name: viaProxyTwoLevels, foo: f9 }, junk: j7 }, more: m1 } = globalThis;
const { Array: { of: { name: viaProxyHostSibling, foo: f10 } }, junk: j8 } = globalThis;
const { Array: { of: { name: viaProxyCtorSibling, foo: f11 } }, Object: { keys: K1 } } = globalThis;
const { of: { name: viaProxyNav, foo: f12 }, junk: j9 } = globalThis.Array;
const { y: { at: userFirst, other: o1 }, junk: j10 } = box;
const { junk: j11, y: { at: userLast, other: o2 } } = box;
const { junk: j12, y: { at: userDefault, other: o3 } = [] } = box;
const { junk: j13, y: { at: userMiddle, other: o4 }, more: m2 } = box;
const { y: { z: { at: userDeep, other: o5 }, junk: j14 } } = deep;
// a SOLE leaf needs no twin: the typed nav claims it over a sibling level whose re-read is a nav
// into the built-in namespace (`typedNavClaimShape`), and the residual keeps the siblings
const { Array: { from: F4, of: { name: soleBesideStatic } } } = globalThis;
const { of: { name: soleBesideJunk }, junk: j21 } = Array;
const { of: { name: soleBesideNavJunk }, junk: j22 } = globalThis.Array;
const { Array: { of: { name: soleBesideHostJunk } }, junk: j23 } = globalThis;
const { y: { at: soleUserBesideJunk }, junk: j25 } = box;
const { junk: j15, of: { name: viaLet, foo: f13 } } = Array;
const { of: { name: viaLeadingDeclarator, foo: f14 }, junk: j16 } = Array, z1 = 1;
const z2 = 1, { of: { name: viaTrailingDeclarator, foo: f15 }, junk: j17 } = Array;
for (const { of: { name: viaForInit, foo: f16 }, junk: j18 } = Array; ;) { [viaForInit, f16, j18]; break; }
if (c) var { of: { name: viaBodyless, foo: f17 }, junk: j19 } = Array;
export const { of: { name: viaExport, foo: f18 }, junk: j20 } = Array;
export {
  hopFirst, f1, j1, j2, hopLast, f2, F1, hopMiddle, f3, I1, F2, hopAfterStatic, f4, hopBeforeStatic, f5, F3, hopRest, r1, j4, viaProxyInner, f7, j5, j6, viaProxyInnerLast, f8, viaProxyTwoLevels, f9, j7, m1,
  viaProxyHostSibling, f10, j8, viaProxyCtorSibling, f11, K1, viaProxyNav, f12, j9, userFirst, o1, j10, j11,
  userLast, o2, j12, userDefault, o3, j13, userMiddle, o4, m2, userDeep, o5, j14, j15, viaLet, f13,
  viaLeadingDeclarator, f14, j16, z1, z2, viaTrailingDeclarator, f15, j17, viaBodyless, f17, j19, F4, soleBesideStatic,
  soleBesideJunk, j21, soleBesideNavJunk, j22, soleBesideHostJunk, j23, soleUserBesideJunk, j25,
};
