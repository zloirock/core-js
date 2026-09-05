import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _self from "@core-js/pure/actual/self";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 6:
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
  const a = _at(src);
  const {
    [(eff(), 'w')]: {
      at: _unused
    }
  } = {
    w: src
  };
}
{
  const _ref = [1];
  const a2 = _atMaybeArray(_ref);
  const {
    [(eff(), 'w')]: {
      at: _unused2
    }
  } = {
    w: _ref
  };
}
{
  const a3 = _at(src);
  const {
    [(eff(), 'w')]: {
      at: _unused3
    }
  } = {
    w: src
  };
}
{
  const f4 = _Array$from;
  const {
    [(eff(), 'w')]: _unused4
  } = {
    w: Array
  };
}
{
  const f1 = _Array$from;
  const {
    [(effectful(), 'Array')]: _unused5
  } = _globalThis;
}
{
  const {
      [(k(), 'at')]: s = d,
      z
    } = eff(),
    q = 2;
  s(z, q);
}
{
  const s = _atMaybeArray(arr);
  const {
    [(k(), 'at')]: _unused6
  } = arr;
  s();
}
{
  const s = _atMaybeArray(arr);
  const {
    [(k(), 'at')]: _unused7,
    ...r
  } = arr;
  s(r);
}
{
  const {
      [(k(), 'at')]: s,
      ...r
    } = eff(),
    q = 2;
  s(r, q);
}
{
  const {
      [(k(), 'at')]: s,
      [(k2(), 'flat')]: f
    } = eff(),
    q = 2;
  s(f, q);
}
{
  const {
    [(k(), 'at')]: s,
    [(k2(), 'flat')]: f
  } = eff();
  s(f);
}
{
  const {
      [(k(), 'at')]: _unused8,
      [(k2(), 'flat')]: _unused9,
      ...r
    } = arr,
    s = _atMaybeArray(arr),
    f = _flatMaybeArray(arr),
    q = 2;
  s(r, f, q);
}
{
  const s = _atMaybeArray(arr);
  const f = _flatMaybeArray(arr);
  const {
    [(k(), 'at')]: _unused10,
    [(k2(), 'flat')]: _unused11,
    ...r
  } = arr;
  s(r, f);
}
{
  const {
    [(k(), 'at')]: s,
    [(k2(), 'flat')]: f,
    ...r
  } = eff();
  s(r, f);
}
{
  const {
      [(k(), 'at')]: _unused12
    } = arr,
    s = _atMaybeArray(arr),
    {
      [(k2(), 'flat')]: _unused13
    } = arr,
    f = _flatMaybeArray(arr),
    {
      z
    } = arr;
  s(z, f);
}
{
  const {
      [(k(), 'at')]: s,
      [(k2(), 'flat')]: f,
      z
    } = eff(),
    q = 2;
  s(z, q, f);
}
{
  const _ref2 = [1, 2],
    {
      [(k(), 'at')]: _unused14,
      z
    } = _ref2,
    s = _atMaybeArray(_ref2),
    q = 2;
  s(z, q);
}
{
  const {
      [(k(), 'at')]: _unused15,
      z
    } = arr,
    s = _atMaybeArray(arr),
    q = 2;
  s(z, q);
}
{
  const s = _atMaybeArray(arr);
  const {
    [(k(), 'at')]: _unused16,
    z
  } = arr;
  s(z);
}
{
  const _ref3 = c ? a1 : a2,
    {
      [(k(), 'at')]: _unused17,
      z
    } = _ref3,
    s = _at(_ref3),
    q = 2;
  s(z, q);
}
{
  const {
      [(k(), 'at')]: s,
      z
    } = eff(),
    q = 2;
  s(z, q);
}
{
  const _ref4 = eff().constructor.prototype,
    {
      [(k(), 'at')]: _unused18,
      z
    } = _ref4,
    s = _at(_ref4),
    q = 2;
  s(z, q);
}
{
  const {
    [(k(), 'at')]: s,
    z
  } = eff();
  s(z);
}
{
  const _ref5 = _globalThis.Array.prototype,
    {
      [(k(), 'at')]: _unused19,
      z
    } = _ref5,
    s = _atMaybeArray(_ref5),
    q = 2;
  s(z, q);
}
{
  const _ref6 = _globalThis.Array.prototype,
    {
      [(k(), 'at')]: _unused20,
      z
    } = _ref6,
    s = _atMaybeArray(_ref6);
  s(z);
}
{
  const _ref7 = holder.p,
    {
      [(k(), 'at')]: _unused21,
      z
    } = _ref7,
    s = _at(_ref7),
    q = 2;
  s(z, q);
}
{
  const _ref8 = holder.p,
    {
      [(k(), 'at')]: _unused22,
      z
    } = _ref8,
    s = _at(_ref8);
  s(z);
}
{
  const _ref9 = _self.Array.prototype,
    {
      [(k(), 'at')]: _unused23,
      z
    } = _ref9,
    s = _atMaybeArray(_ref9);
  s(z);
}
{
  const {
      [(k(), 'at')]: v,
      flat: w
    } = eff(),
    q = 2;
  v(w, q);
}
{
  const {
    [(k(), 'at')]: v,
    flat: w
  } = eff();
  v(w);
}
{
  const fr = _Object$freeze;
  const {
    [(k(), 'freeze')]: _unused24,
    z
  } = _globalThis.Object;
  fr(z);
}
{
  const {
    a,
    w: {
      at: m
    }
  } = {
    a: g(),
    w: eff()
  };
  use(a, m);
}
{
  var _ref10;
  const {
    a,
    w: {
      at: _unused25
    }
  } = {
    a: g(),
    w: _ref10 = obj.p
  };
  const m = _at(_ref10);
  use(a, m);
}
{
  const {
    a,
    w: {
      at: m
    },
    z
  } = {
    a: g(),
    w: eff(),
    z: 1
  };
  use(a, m, z);
}
{
  const hasOwn = _Object$hasOwn;
}
{
  const {
    a: eff1 = eff(),
    w: {
      from: f
    }
  } = {
    a: undefined,
    w: pick ? {
      from: _Array$from
    } : userObj
  };
  _pushMaybeArray(log).call(log, f === _Array$from, eff1);
}
{
  const f14 = _Array$from;
  const {
    a: {
      [(eff('k'), 'Array')]: _unused26
    }
  } = {
    a: _globalThis
  };
}
{
  const a = _at(id(arr));
}
{
  const m = _atMaybeArray((mark(), [1, 2]));
  use(m);
}