import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
// A claim ahead of a nested level reads the receiver's one evaluation, and the level's own claim reads it
// too, through the memo of its hop - over `this`, an optional member and a sequence ending in a call, in a
// `let` and a `var` declaration, behind a declarator ahead of it and beside a second claim ahead.
function own() {
  const _ref = this;
  const includes = _includes(_ref);
  const _ref2 = _ref.y;
  const at = _at(_ref2);
  const {
    other: {
      q
    }
  } = _ref2;
  return [includes, at, q];
}
const _ref3 = src?.box;
const keys = _keys(_ref3);
const _ref4 = _ref3.w;
const findLast = _findLastMaybeArray(_ref4);
const {
  last: {
    t
  }
} = _ref4;
const _ref5 = (e(), mk());
let values = _values(_ref5);
const _ref6 = _ref5.v;
let flat = _flatMaybeArray(_ref6);
let {
  more: {
    r
  }
} = _ref6;
const _ref7 = mk2();
var entries = _entries(_ref7);
const _ref8 = _ref7.u;
var find = _findMaybeArray(_ref8);
var {
  rest: {
    s
  }
} = _ref8;
const n = count();
const _ref9 = mk3();
const fill = _fillMaybeArray(_ref9);
const _ref10 = _ref9.x;
const findIndex = _findIndexMaybeArray(_ref10);
const {
  deep: {
    p
  }
} = _ref10;
const _ref11 = mk4();
const copyWithin = _copyWithinMaybeArray(_ref11);
const toSorted = _toSortedMaybeArray(_ref11);
const _ref12 = _ref11.z;
const flatMap = _flatMapMaybeArray(_ref12);
const {
  tail: {
    o
  }
} = _ref12;
use(own, keys, findLast, t, values, flat, r, entries, find, s, n, fill, findIndex, p, copyWithin, toSorted, flatMap, o);