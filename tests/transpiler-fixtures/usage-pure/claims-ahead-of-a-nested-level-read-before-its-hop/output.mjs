import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
var _ref3;
// Claims written ahead of a nested level whose own claim leads it read their slots first: the level's
// memo reads the hop where the source wrote that level, behind the extractions of the claims ahead of it,
// and a claim written after the level follows it - one claim ahead, two ahead and one behind, a defaulted
// claim in the level, and an iterator one.
const includes = _includes(box);
const _ref = box.y;
const at = _at(_ref);
const {
  other: {
    q
  }
} = _ref;
const flat = _flatMaybeArray(box2);
const fill = _fillMaybeArray(box2);
const _ref2 = box2.z;
const find = _findMaybeArray(_ref2);
const {
  more: {
    r
  }
} = _ref2;
const keys = _keys(box2);
const values = _values(box3);
const _ref4 = box3.w;
const findLast = (_ref3 = _findLastMaybeArray(_ref4)) === void 0 ? null : _ref3;
const {
  last: {
    t
  }
} = _ref4;
var entries = _entries(box4);
const _ref5 = box4.v;
var it = _getIteratorMethod(_ref5);
var {
  first: {
    u
  }
} = _ref5;
use(includes, at, q, flat, fill, find, r, keys, values, findLast, t, entries, it, u);