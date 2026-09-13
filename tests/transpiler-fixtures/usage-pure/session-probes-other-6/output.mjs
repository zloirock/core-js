import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _self from "@core-js/pure/actual/self";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
  const _ref2 = {
      w: src
    },
    {
      [(eff(), 'w')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    _ref3 = _ref,
    a = null == _ref3 ? _ref3[""] : _at(_ref3);
}
{
  const _ref5 = {
      w: [1]
    },
    {
      [(eff(), 'w')]: _ref4
    } = null == _ref5 ? _ref5[""] : _ref5,
    _ref6 = _ref4,
    a2 = null == _ref6 ? _ref6[""] : _atMaybeArray(_ref6);
}
{
  const _ref8 = {
      w: src
    },
    {
      [(eff(), 'w')]: _ref7
    } = null == _ref8 ? _ref8[""] : _ref8,
    _ref9 = _ref7,
    a3 = null == _ref9 ? _ref9[""] : _at(_ref9);
}
{
  const f4 = _Array$from;
  const {
    [(eff(), 'w')]: _unused
  } = {
    w: Array
  };
}
{
  const f1 = _Array$from;
  const {
    [(effectful(), 'Array')]: _unused2
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
  const _ref10 = arr,
    s = null == _ref10 ? _ref10[""] : (k(), _atMaybeArray(_ref10));
  s();
}
{
  const {
    [(k(), 'at')]: s,
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
      [(k(), 'at')]: s,
      [(k2(), 'flat')]: f,
      ...r
    } = arr,
    q = 2;
  s(r, f, q);
}
{
  const {
    [(k(), 'at')]: s,
    [(k2(), 'flat')]: f,
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
  const _ref11 = arr,
    _ref12 = _ref11,
    s = null == _ref12 ? _ref12[""] : (k(), _atMaybeArray(_ref12)),
    _ref13 = _ref11,
    f = null == _ref13 ? _ref13[""] : (k2(), _flatMaybeArray(_ref13)),
    {
      z
    } = _ref11;
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
  const _ref14 = [1, 2],
    _ref15 = _ref14,
    s = null == _ref15 ? _ref15[""] : (k(), _atMaybeArray(_ref15)),
    {
      z
    } = _ref14,
    q = 2;
  s(z, q);
}
{
  const _ref16 = arr,
    _ref17 = _ref16,
    s = null == _ref17 ? _ref17[""] : (k(), _atMaybeArray(_ref17)),
    {
      z
    } = _ref16,
    q = 2;
  s(z, q);
}
{
  const _ref18 = arr,
    _ref19 = _ref18,
    s = null == _ref19 ? _ref19[""] : (k(), _atMaybeArray(_ref19)),
    {
      z
    } = _ref18;
  s(z);
}
{
  const _ref20 = c ? a1 : a2,
    _ref21 = _ref20,
    s = null == _ref21 ? _ref21[""] : (k(), _at(_ref21)),
    {
      z
    } = _ref20,
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
  const _ref22 = eff().constructor.prototype,
    _ref23 = _ref22,
    s = null == _ref23 ? _ref23[""] : (k(), _at(_ref23)),
    {
      z
    } = _ref22,
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
  const _ref24 = _globalThis.Array.prototype,
    _ref25 = _ref24,
    s = null == _ref25 ? _ref25[""] : (k(), _atMaybeArray(_ref25)),
    {
      z
    } = _ref24,
    q = 2;
  s(z, q);
}
{
  const _ref26 = _globalThis.Array.prototype,
    _ref27 = _ref26,
    s = null == _ref27 ? _ref27[""] : (k(), _atMaybeArray(_ref27)),
    {
      z
    } = _ref26;
  s(z);
}
{
  const _ref28 = holder.p,
    _ref29 = _ref28,
    s = null == _ref29 ? _ref29[""] : (k(), _at(_ref29)),
    {
      z
    } = _ref28,
    q = 2;
  s(z, q);
}
{
  const _ref30 = holder.p,
    _ref31 = _ref30,
    s = null == _ref31 ? _ref31[""] : (k(), _at(_ref31)),
    {
      z
    } = _ref30;
  s(z);
}
{
  const _ref32 = _self.Array.prototype,
    _ref33 = _ref32,
    s = null == _ref33 ? _ref33[""] : (k(), _atMaybeArray(_ref33)),
    {
      z
    } = _ref32;
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
  const _ref34 = _globalThis.Object,
    fr = null == _ref34 ? _ref34[""] : (k(), _Object$freeze),
    {
      z
    } = _ref34;
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
  const _ref35 = {
    a: g(),
    w: obj.p
  };
  const {
    a
  } = _ref35;
  const m = _at(_ref35.w);
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
      [(eff('k'), 'Array')]: _unused3
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