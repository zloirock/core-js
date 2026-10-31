import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
// two claimed hosts in ONE declaration take the sibling-declarator canon each: an object hop beside
// an array wrapper (either order), two array wrappers, each memo standing behind the declarators
// written ahead of its host and the join retaining binding order; a symbol leaf under a hop beside a
// sibling takes the slot memo like the instance leaf of the same slot
function twoHostsOneDeclaration(eff) {
  const _ref = {
      a: eff(),
      w: eff()
    },
    {
      a
    } = _ref,
    hostObjAt = _at(_ref.w);
  const _ref2 = eff();
  const hostArrFlat = _flatMaybeArray(_ref2),
    [{}, hz] = [_ref2, 1];
  const _ref3 = eff();
  const firstFlat = _flatMaybeArray(_ref3),
    [{}, fz] = [_ref3, 1],
    mid = 3;
  const _ref4 = eff();
  const secondAt = _at(_ref4),
    [{}, sz] = [_ref4, 2],
    tail = 4;
  const _ref5 = {
    b: eff(),
    w: eff()
  };
  const {
    b
  } = _ref5;
  const symInSlot = _getIteratorMethod(_ref5.w);
  const _ref6 = {
    w: eff(),
    c: 1
  };
  const symHoist = _getIteratorMethod(_ref6.w);
  const {
    c
  } = _ref6;
  const symQ = 2;
  return [a, hostObjAt, hostArrFlat, hz, firstFlat, fz, mid, secondAt, sz, tail, b, symInSlot, symHoist, c, symQ];
}
export default [twoHostsOneDeclaration(() => [[1], 2])];