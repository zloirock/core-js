import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const c = 1;
const userObj = {};
const arr = [1, 2];
const nb = {
  y: arr
};
const rest = [];
const more = {};
const wrapped = [Object];
const log = [];
const obj = {};
const rows = [];
const k = 'k';
let kw;
const nul = null;
function eff() {
  return Object;
}
function eff2() {}
function mark(t, v) {
  _pushMaybeArray(log).call(log, t);
  return v;
}
{
  for (const _r of [{
    w: Object
  }]) {
    let is = _Object$is;
    is;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let keys = _Object$keys;
    keys;
  }
}
{
  for (const {
    is
  } of [{
    is: _Object$is
  }, {
    is: _Object$is
  }]) is;
}
{
  for (const {
    is
  } of [{
    is: _Object$is
  }]) is;
}
{
  for (const {
    w: {
      is
    }
  } of [{
    w: {
      is: _Object$is
    }
  }]) is;
}
{
  const arr = [...[[1], [2]]];
  for (const e of arr) _atMaybeArray(e).call(e, 0);
}
{
  const k = 'w';
  for (const _ref in obj) {
    let m = _at(_ref.w);
    use(m);
  }
}
{
  const rows = [{
    w: Object
  }];
  for (const {
    w: {
      is
    }
  } of rows) is;
}
{
  for (const _ref2 of [[[1]], [[1]]]) {
    let [[{
      at
    }]] = _ref2;
    at;
  }
}
{
  for (const [[{
    entries
  }]] of [[[{
    entries: _Object$entries
  }]]]) entries;
}
{
  for (const _ref4 of [[[1]]]) {
    let [_ref3] = _ref4;
    let at = _atMaybeArray(_ref3);
    at;
  }
}
{
  for (const [{
    entries
  }] of [[{
    entries: _Object$entries
  }], [{
    entries: _Object$entries
  }]]) entries;
}
{
  for (const [{
    entries
  }] of [[{
    entries: _Object$entries
  }]]) entries;
}
{
  for (const [{
    hasOwn
  }] of [[Object], [, Object]]) hasOwn;
}
{
  for (const [{
    hasOwn
  }] of [[{
    hasOwn: _Object$hasOwn
  }], [{
    hasOwn: _Object$hasOwn
  }]]) hasOwn;
}
{
  for (const [{
    is
  }] of [[{
    is: _Object$is
  }], [{
    is: _Object$is
  }]]) is;
}
{
  for (const [{
    is
  }] of [[{
    is: _Object$is
  }]]) is;
}
{
  for (const [{
    keys
  }] of [[{
    keys: _Object$keys
  }], [{
    keys: _Object$keys
  }]]) keys;
}
{
  for (const [{
    values = null
  }] of [[{
    values: _Object$values
  }]]) values;
}
{
  for (const _ref6 of [[Object], [userObj]]) {
    let [_ref5] = _ref6;
    let values = _values(_ref5);
    values;
  }
}
{
  for (const [{
    values
  }] of [[{
    values: _Object$values
  }]]) values;
}
{
  for (const _ref8 of [[r]]) {
    let [_ref7] = _ref8;
    let _ref9 = _ref7.w;
    let values = _values(_ref9);
    let {
      values: _unused
    } = _ref9;
    let {
      y: {
        at
      }
    } = _ref7;
    [values, at];
  }
}
{
  for (const _r in obj) {
    let keys = _keys(_r.w);
    keys;
  }
}
{
  for (const _r of [[Object]]) {
    let [_ref10] = _r;
    let values = _values(_ref10);
    values;
  }
}
{
  for (const _r of [_globalThis]) {
    let from = _Array$from;
    from;
  }
}
{
  for (const _r of [{
    w: Object
  }, {
    w: userObj
  }]) {
    let keys = _keys(_r.w);
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) for (const _s of [_r]) {
    let keys = _Object$keys;
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    keys = _Object$keys;
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    const x = 1;
    let keys = _Object$keys;
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    const keys = _Object$keys;
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let x = _r;
    let keys = _Object$keys;
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let entries = _Object$entries;
    let {
      w: _unused2,
      ...rest
    } = _r;
    entries;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let hasOwn = _Object$hasOwn;
    hasOwn;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let keys = _keys(_q.w);
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let keys = _Object$keys;
    let other = 1;
    keys;
  }
}
{
  for (const _r of [{
    w: Object
  }]) {
    let keys = _Object$keys;
    _r.w = 1;
    keys;
  }
}
{
  for (const _r of [{
    w: Object,
    y: [1]
  }]) {
    let values = _Object$values;
    let at = _at(_r.y);
    [values, at];
  }
}
{
  for (const {
    Array: {
      from
    }
  } of [_globalThis, {
    Array
  }]) from;
}
{
  for (const {
    Object: {
      keys
    }
  } of [{
    Object: {
      keys: _Object$keys
    }
  }, {
    Object: {
      keys: _Object$keys
    }
  }]) keys;
}