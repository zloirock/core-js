import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Map2 from "@core-js/pure/actual/map";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$is from "@core-js/pure/actual/object/is";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 4:
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
  const k = 'w';
  const {
    [k]: {
      at: m
    }
  } = {
    w: eff()
  };
  use(m);
}
{
  const k = 'w';
  const m = _at(_globalThis.arr);
  use(m);
}
{
  const k = 'w';
  let m;
  m = _Map;
  use(m);
}
{
  const k = 'w';
  let m;
  m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const k = 'w';
  let m;
  ({
    [k]: {
      at: m
    }
  } = {
    w: eff()
  });
  use(m);
}
{
  const k = 'z';
  const wrapper = {
    w: _globalThis,
    z: [1, 2]
  };
  {
    const k = 'w';
    const m = _Map;
    use(m);
  }
}
{
  const known = {
    w: Object,
    y: [1]
  };
  _pushMaybeArray(log).call(log, 's');
  const is = _Object$is;
  const at = _atMaybeArray(known.y);
  [is, at];
}
{
  const m = new (id(_Map2))();
}
{
  var _ref;
  const o = {
    data: [1]
  };
  const r = _atMaybeArray(_ref = o[eff(), 'data']).call(_ref, 0);
}
{
  const q = 1;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  [q, values, at];
}
{
  const q = 2,
    {
      [(k(), 'at')]: s
    } = eff();
  s(q);
}
{
  const q = 2,
    {
      [(k(), 'at')]: s,
      z
    } = eff();
  s(z, q);
}
{
  const q = eff0(),
    {
      [(k(), 'at')]: s
    } = eff();
  s(q);
}
{
  const q = eff0(),
    {
      [(k(), 'at')]: s,
      z
    } = eff();
  s(z, q);
}
{
  const r = id(Array).from([1]);
}
{
  var _ref2;
  const r = _at(_ref2 = id(arr)).call(_ref2, 0) + id(Array).isArray(1);
}
{
  var _ref3;
  const r = _at(_ref3 = id(arr)).call(_ref3, 0);
}
{
  var _ref4;
  const r = _at(_ref4 = o[eff(), 'data']).call(_ref4, 0);
}
{
  var _ref5;
  const r3 = _at(_ref5 = o[eff(), 's']).call(_ref5, 0);
}
{
  var _ref6;
  const r4 = _at(_ref6 = o[eff(), E.A]).call(_ref6, 0);
}
{
  var _ref7;
  const r5 = o == null ? void 0 : _at(_ref7 = o[eff(), 'data']).call(_ref7, 0);
}
{
  var _ref8;
  const t = typeof _valuesMaybeArray(Array.prototype);
  const raw = Array.prototype[_joinMaybeArray(_ref8 = ['val', 'ues']).call(_ref8, '')];
  const raw2 = Function('return Array.prototype.values')();
}
{
  const v = _Object$freeze(Array);
  v.from([]);
}
{
  const {
    '0': {
      from: f
    }
  } = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  const {
    0: {
      from: f
    }
  } = [, pick ? Array : userObj];
}
{
  const f = _Array$from;
}
{
  const {
    0: {
      from: f
    }
  } = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  const {
    1: {
      from: f
    }
  } = [...x, pick ? Array : userObj];
}
{
  const {
    1: {
      from: f
    }
  } = [0, pick ? {
    from: _Array$from
  } : userObj];
}
{
  const f6 = _Array$from;
  const {
    [(eff('k'), 'from')]: _unused
  } = _globalThis.Array;
}
{
  const f = _Array$from;
  const {
    [(eff('k2'), 'from')]: _unused2
  } = _globalThis.Array;
}
{
  const f = _Array$from;
  const {
    Array: {
      [(eff('k2'), 'from')]: _unused3
    },
    ...r
  } = _globalThis;
}
{
  const {
    Array: {
      from
    }
  } = id(_globalThis);
}
{
  const from = _Array$from;
  const {
    Array: _unused4,
    ...rest
  } = _globalThis;
  use(from, rest);
}
{
  const F = _Array$from;
  F();
}
{
  const F = _Array$from;
  const {
    z
  } = _globalThis;
  F(z);
}
{
  const f = _Array$from;
  const {
    Array: _unused5,
    ...r
  } = _globalThis;
}
{
  const f1 = _Array$from;
}
{
  const f2 = _Array$from;
  const {
    Array: _unused6,
    ...r2
  } = _globalThis;
}