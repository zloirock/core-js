import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 5:
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
  const {
    length: L
  } = _Array$from;
  L();
}
{
  const {
    Array: {
      prototype: {
        values: v
      }
    },
    ...r
  } = _globalThis;
}
{
  const v1 = _valuesMaybeArray(_globalThis.Array.prototype);
}
{
  const {
    KEY: {
      at: m
    },
    ...rest
  } = {
    w: [1, 2],
    z: 1
  };
  use(m, rest);
}
{
  const M = _Map;
  M();
}
{
  const m = _Map;
  use(m);
}
{
  const {
    ['w']: {
      from: f
    }
  } = {
    w: pick ? Array : userObj
  };
}
{
  const a = _at(src);
}
{
  var _ref2;
  const _ref = [9],
    w7 = null == _ref ? _ref[""] : (e7(), (_ref2 = _withMaybeArray(_ref)) === void 0 ? dfltF() : _ref2);
  use(w7);
}
{
  const {
    [(e7(), 'with')]: w7 = dfltG()
  } = eff();
  w7();
}
{
  var _ref5;
  const _ref3 = [9],
    _ref4 = _ref3,
    w7 = null == _ref4 ? _ref4[""] : (e7(), (_ref5 = _withMaybeArray(_ref4)) === void 0 ? dfltG() : _ref5),
    _ref6 = _ref3,
    t8 = null == _ref6 ? _ref6[""] : (e8(), _toSplicedMaybeArray(_ref6));
  w7(t8);
}
{
  const {
    [(e7(), 'with')]: w7 = dfltG(),
    [(e8(), 'toSpliced')]: t8
  } = eff();
  w7(t8);
}
{
  const _ref8 = _globalThis,
    {
      [(eff('k'), 'Array')]: _ref7
    } = null == _ref8 ? _ref8[""] : _ref8,
    _ref9 = _ref7,
    f = null == _ref9 ? _ref9[""] : (eff('k2'), _Array$from);
}
{
  const _ref11 = _globalThis,
    {
      [(eff('k'), 'Array')]: _ref10
    } = null == _ref11 ? _ref11[""] : _ref11,
    _ref12 = _ref10,
    it16 = null == _ref12 ? _ref12[""] : _getIteratorMethod(_ref12);
}
{
  const f = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused
  } = _globalThis;
}
{
  const f1 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused2
  } = _globalThis;
}
{
  const f11 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused3
  } = _globalThis;
}
{
  const f15 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused4
  } = _globalThis;
}
{
  const f5 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused5,
    z
  } = _globalThis;
}
{
  const f7 = _Array$from;
  const o7 = _Array$of;
  const {
    [(eff('k'), 'Array')]: _unused6
  } = _globalThis;
}
{
  const {
    [(eff('k'), 'Array')]: {
      from: f8
    },
    ...rest
  } = _globalThis;
}
{
  const _ref14 = _globalThis,
    {
      [(eff('k'), 'Array')]: _ref13
    } = null == _ref14 ? _ref14[""] : _ref14,
    {
      prototype: _ref15
    } = _ref13,
    _ref16 = _ref15,
    f2 = null == _ref16 ? _ref16[""] : _valuesMaybeArray(_ref16);
}
{
  const _ref17 = g(),
    a = null == _ref17 ? _ref17[""] : (eff('k'), _at(_ref17));
}
{
  const _ref18 = Array,
    f3 = null == _ref18 ? _ref18[""] : (eff('k'), _Array$from);
}
{
  const f12 = _Array$from;
  const {
    [(eff('k'), 'self')]: _unused7
  } = _globalThis;
}
{
  const _ref20 = {
      w: src
    },
    {
      [(eff('k'), 'w')]: _ref19
    } = null == _ref20 ? _ref20[""] : _ref20,
    _ref21 = _ref19,
    a = null == _ref21 ? _ref21[""] : (eff('k2'), _at(_ref21));
}
{
  const _ref23 = {
      w: Array
    },
    {
      [(eff('k'), 'w')]: _ref22
    } = null == _ref23 ? _ref23[""] : _ref23,
    _ref24 = _ref22,
    f = null == _ref24 ? _ref24[""] : (eff('k2'), _Array$from);
}
{
  const _ref26 = {
      w: [1]
    },
    {
      [(eff('k'), 'w')]: _ref25
    } = null == _ref26 ? _ref26[""] : _ref26,
    _ref27 = _ref25,
    a = null == _ref27 ? _ref27[""] : _atMaybeArray(_ref27);
}
{
  const _ref29 = {
      w: [1]
    },
    {
      [(eff('k'), 'w')]: _ref28
    } = null == _ref29 ? _ref29[""] : _ref29,
    _ref30 = _ref28,
    f13 = null == _ref30 ? _ref30[""] : _atMaybeArray(_ref30);
}
{
  const _ref32 = {
      w: g()
    },
    {
      [(eff('k'), 'w')]: _ref31
    } = null == _ref32 ? _ref32[""] : _ref32,
    _ref33 = _ref31,
    f19 = null == _ref33 ? _ref33[""] : _at(_ref33);
}
{
  const _ref35 = {
      w: arr
    },
    {
      [(eff('k'), 'w')]: _ref34
    } = null == _ref35 ? _ref35[""] : _ref35,
    _ref36 = _ref34,
    f20 = null == _ref36 ? _ref36[""] : _atMaybeArray(_ref36);
}
{
  const f4 = _Array$from;
  const {
    [(eff('k'), 'w')]: _unused8
  } = {
    w: Array
  };
}
{
  const f4b = _Array$from;
  const {
    [(eff('k'), 'w')]: _unused9,
    z
  } = {
    w: Array,
    z: 1
  };
}
{
  const _ref38 = _globalThis,
    {
      [(eff(), 'Array')]: _ref37
    } = null == _ref38 ? _ref38[""] : _ref38,
    _ref39 = _ref37,
    f = null == _ref39 ? _ref39[""] : (eff(), _Array$from);
}
{
  const f = _Array$from;
  const {
    [(eff(), 'Array')]: _unused10
  } = _globalThis;
}
{
  const _ref41 = _globalThis,
    {
      [(eff(), 'Array')]: _ref40
    } = null == _ref41 ? _ref41[""] : _ref41,
    {
      prototype: _ref42
    } = _ref40,
    _ref43 = _ref42,
    v2 = null == _ref43 ? _ref43[""] : _valuesMaybeArray(_ref43);
}