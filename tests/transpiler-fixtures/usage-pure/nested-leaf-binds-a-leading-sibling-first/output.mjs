import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
var _ref4;
// a nested leaf level holding a claim beside other bindings reads as its flat twin: one memo of the hop,
// and a binding written ahead of the claim binds first in every host the pattern stands in. a claim
// written first extracts first
const _ref = box.y,
  {
    other: {
      q
    }
  } = _ref,
  at = _at(_ref);
const {
    k
  } = box,
  _ref2 = box.y,
  {
    more: {
      r
    }
  } = _ref2,
  flat = _flatMaybeArray(_ref2);
const z = 1,
  _ref3 = box.y,
  {
    last: [s]
  } = _ref3,
  includes = _includes(_ref3);
let fill, kept;
_ref4 = box.c.y, {
  kept
} = _ref4, fill = _fillMaybeArray(_ref4);
for (const _ref5 = box.y, {
    head: {
      h
    }
  } = _ref5, entries = _entries(_ref5);;) break;
try {
  f();
} catch (_ref6) {
  let _ref7 = _ref6.y,
    {
      thrown: {
        t
      }
    } = _ref7,
    keys = _keys(_ref7);
  use(t, keys);
}
const _ref8 = box.y;
const values = _values(_ref8);
const {
  tail: {
    u
  }
} = _ref8;
use(q, at, k, r, flat, z, s, includes, fill, kept, values, u);