import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
// a host-level claim written ahead of a nested leaf the twin splits out extracts once, beside a twin that reads its
// hop once - behind a default, a symbol key or a second host claim alike - and an assignment twin reads its hop once
// whatever parentheses wrap the statement
function rows(box) {
  var _ref2;
  const includes = _includes(box);
  const _ref = box.y,
    {
      other: {
        q
      }
    } = _ref,
    at = _at(_ref);
  const keys = (_ref2 = _keys(box)) === void 0 ? null : _ref2;
  const _ref3 = box.z,
    {
      more: {
        r
      }
    } = _ref3,
    flat = _flatMaybeArray(_ref3);
  const it = _getIteratorMethod(box);
  const _ref4 = box.w,
    {
      past: {
        s
      }
    } = _ref4,
    find = _findMaybeArray(_ref4);
  const entries = _entries(box);
  const values = _values(box);
  const _ref5 = box.v,
    {
      next: {
        n
      }
    } = _ref5,
    fill = _fillMaybeArray(_ref5);
  let findLast, findLastIndex, copyWithin, findIndex;
  const _ref6 = box.u;
  findLast = _findLastMaybeArray(_ref6);
  findLastIndex = _findLastIndexMaybeArray(_ref6);
  const _ref7 = box.t;
  copyWithin = _copyWithinMaybeArray(_ref7);
  findIndex = _findIndexMaybeArray(_ref7);
  return [[includes, q, at], [keys, r, flat], [it, s, find], [entries, values, n, fill], [findLast, findLastIndex, copyWithin, findIndex]];
}
use(rows);