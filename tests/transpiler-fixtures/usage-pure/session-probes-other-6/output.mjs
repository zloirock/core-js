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
  const _ref2 = {
      w: src
    },
    {
      [(eff(), 'w')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    a = _at(_ref);
}
{
  const _ref4 = {
      w: [1]
    },
    {
      [(eff(), 'w')]: _ref3
    } = null == _ref4 ? _ref4[""] : _ref4,
    a2 = _atMaybeArray(_ref3);
}
{
  const _ref6 = {
      w: src
    },
    {
      [(eff(), 'w')]: _ref5
    } = null == _ref6 ? _ref6[""] : _ref6,
    a3 = _at(_ref5);
}
{
  const {
    [(eff(), 'w')]: {
      from: f4
    }
  } = {
    w: {
      from: _Array$from
    }
  };
}
{
  const {
    [(effectful(), 'Array')]: {
      from: f1
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
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
  const _ref7 = arr,
    s = null == _ref7 ? _ref7[""] : (k(), _atMaybeArray(_ref7));
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
  const _ref8 = arr,
    s = null == _ref8 ? _ref8[""] : (k(), _atMaybeArray(_ref8)),
    _ref9 = _ref8,
    f = null == _ref9 ? _ref9[""] : (k2(), _flatMaybeArray(_ref9)),
    {
      z
    } = _ref8;
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
  const _ref10 = [1, 2],
    s = null == _ref10 ? _ref10[""] : (k(), _atMaybeArray(_ref10)),
    {
      z
    } = _ref10,
    q = 2;
  s(z, q);
}
{
  const _ref11 = arr,
    s = null == _ref11 ? _ref11[""] : (k(), _atMaybeArray(_ref11)),
    {
      z
    } = _ref11,
    q = 2;
  s(z, q);
}
{
  const _ref12 = arr,
    s = null == _ref12 ? _ref12[""] : (k(), _atMaybeArray(_ref12)),
    {
      z
    } = _ref12;
  s(z);
}
{
  const _ref13 = c ? a1 : a2,
    s = null == _ref13 ? _ref13[""] : (k(), _at(_ref13)),
    {
      z
    } = _ref13,
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
  const _ref14 = eff().constructor.prototype,
    s = null == _ref14 ? _ref14[""] : (k(), _at(_ref14)),
    {
      z
    } = _ref14,
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
  const _ref15 = _globalThis.Array.prototype,
    s = null == _ref15 ? _ref15[""] : (k(), _atMaybeArray(_ref15)),
    {
      z
    } = _ref15,
    q = 2;
  s(z, q);
}
{
  const _ref16 = _globalThis.Array.prototype,
    s = null == _ref16 ? _ref16[""] : (k(), _atMaybeArray(_ref16)),
    {
      z
    } = _ref16;
  s(z);
}
{
  const _ref17 = holder.p,
    s = null == _ref17 ? _ref17[""] : (k(), _at(_ref17)),
    {
      z
    } = _ref17,
    q = 2;
  s(z, q);
}
{
  const _ref18 = holder.p,
    s = null == _ref18 ? _ref18[""] : (k(), _at(_ref18)),
    {
      z
    } = _ref18;
  s(z);
}
{
  const _ref19 = _self.Array.prototype,
    s = null == _ref19 ? _ref19[""] : (k(), _atMaybeArray(_ref19)),
    {
      z
    } = _ref19;
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
  const _ref20 = _globalThis.Object,
    fr = (k(), _Object$freeze),
    {
      z
    } = _ref20;
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
  const _ref21 = {
    a: g(),
    w: obj.p
  };
  const {
    a
  } = _ref21;
  const m = _at(_ref21.w);
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
  const {
    a: [{
      hasOwn
    }]
  } = {
    a: [{
      hasOwn: _Object$hasOwn
    }]
  };
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
  const {
    a: {
      [(eff('k'), 'Array')]: {
        from: f14
      }
    }
  } = {
    a: {
      Array: {
        from: _Array$from
      }
    }
  };
}
{
  const a = _at(id(arr));
}
{
  const m = _atMaybeArray((mark(), [1, 2]));
  use(m);
}