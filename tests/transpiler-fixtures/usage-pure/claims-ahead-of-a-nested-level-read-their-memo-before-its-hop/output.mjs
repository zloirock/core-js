import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
// Claims written ahead of a nested level over a receiver they memoize: the call, member or sequence init is
// read once, those claims read that memo first, and the level's own memo of the hop follows them - ahead of
// the level's claims, which read it.
const _ref = mk();
const includes = _includes(_ref);
const _ref2 = _ref.y;
const at = _at(_ref2);
const {
  other: {
    q
  }
} = _ref2;
const _ref3 = o.p;
const flat = _flatMaybeArray(_ref3);
const _ref4 = _ref3.z;
const find = _findMaybeArray(_ref4);
const {
  more: {
    r
  }
} = _ref4;
const _ref5 = (e(), box);
const keys = _keys(_ref5);
const _ref6 = _ref5.w;
const findLast = _findLastMaybeArray(_ref6);
const {
  last: {
    t
  }
} = _ref6;
use(includes, at, q, flat, find, r, keys, findLast, t);