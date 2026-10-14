import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
var _ref, _unused, _unused3;
// A member target beside a rest takes the ponyfill like its binding twin, the rest keeping the key as a
// sentinel: on the host's own level the extraction writes into the slot, a key without a polyfill beside it and
// a dead default of the target included; one level down the hop capture writes it ahead of the rest copy.
const o = {};
let rest, rest2, rest3, rest4, c, c4;
o.v = _Object$values, {
  values: _unused,
  ...rest
} = Object;
var _unused2;
o.f = _Object$fromEntries;
({
  fromEntries: _unused2,
  custom: c,
  ...rest2
} = Object);
({
  Array: _ref
} = _globalThis), o.a = _Array$from, {
  from: _unused3,
  ...rest3
} = _ref;
var _unused4;
o.e = _Object$entries;
({
  entries: _unused4,
  custom: c4,
  ...rest4
} = cond ? Object : _self.Object);