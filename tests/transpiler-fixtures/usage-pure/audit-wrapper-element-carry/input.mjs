// a nested claim inside an array wrapper's element is carried through the captured element: the whole
// array initializer runs first - an effectful neighbouring element included - and each receiver is read
// once, after it. a plain declaration reads its receiver once too, a neighbouring declarator keeping
// its place; a sibling key reads the same capture, a rest keeps the level native with its claim, and
// an effectful computed key runs on the captured value, after the coercibility check.
const arr = [3, [1, 2]];
const hb = { get y() { return [3, [1, 2]]; } };
let out;
const { y: { at: viaDeclSibling } } = { y: hb.y }, viaDeclSiblingZ = 1;
const [{ y: { includes: viaWrapSole } }] = [{ y: hb.y }];
const [{ y: { findLast: viaWrapNeighbour } }, viaWrapNeighbourZ] = [{ y: hb.y }, hb.y];
const [{ y: { findLastIndex: viaWrapCarried } }] = [{ y: arr.flat() }];
const [{ y: { toSorted: viaWrapCarriedRest, ...viaWrapCarriedRestOther } }] = [{ y: arr.flatMap(x => x) }];
const [{ y: { toReversed: viaWrapCarriedSib }, wz: viaWrapCarriedSibZ }] = [{ y: arr.concat(), wz: 1 }];
const [{ y: { [(out = 3, 'fill')]: viaWrapCarriedKey } }] = [{ y: arr.map(x => x) }];
const [{ y: { with: viaWrapCarriedNeighbour } }, viaWrapCarriedNeighbourZ] = [{ y: arr.filter(x => x) }, arr.toSpliced(0, 0)];
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ, out };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };
