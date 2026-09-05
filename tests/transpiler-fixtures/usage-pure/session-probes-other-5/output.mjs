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
import _Map from "@core-js/pure/actual/map/constructor";
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
  const v = _valuesMaybeArray(_globalThis.Array.prototype);
  const {
    Array: _unused,
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
  const _ref = [9];
  const {
      [(e7(), 'with')]: _unused2
    } = _ref,
    w7 = (_ref2 = _withMaybeArray(_ref)) === void 0 ? dfltF() : _ref2;
  use(w7);
}
{
  const {
    [(e7(), 'with')]: w7 = dfltG()
  } = eff();
  w7();
}
{
  var _ref4;
  const _ref3 = [9],
    {
      [(e7(), 'with')]: _unused3
    } = _ref3,
    w7 = (_ref4 = _withMaybeArray(_ref3)) === void 0 ? dfltG() : _ref4,
    {
      [(e8(), 'toSpliced')]: _unused4
    } = _ref3,
    t8 = _toSplicedMaybeArray(_ref3);
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
  const f = _Array$from;
  const {
    [(eff('k'), 'Array')]: {
      [(eff('k2'), 'from')]: _unused5
    }
  } = _globalThis;
}
{
  const it16 = _getIteratorMethod(_globalThis.Array);
  const {
    [(eff('k'), 'Array')]: _unused6
  } = _globalThis;
}
{
  const f = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused7
  } = _globalThis;
}
{
  const f1 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused8
  } = _globalThis;
}
{
  const f11 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused9
  } = _globalThis;
}
{
  const f15 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused10
  } = _globalThis;
}
{
  const f5 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused11,
    z
  } = _globalThis;
}
{
  const f7 = _Array$from;
  const o7 = _Array$of;
  const {
    [(eff('k'), 'Array')]: _unused12
  } = _globalThis;
}
{
  const f8 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused13,
    ...rest
  } = _globalThis;
}
{
  const f2 = _valuesMaybeArray(_globalThis.Array.prototype);
  const {
    [(eff('k'), 'Array')]: _unused14
  } = _globalThis;
}
{
  const _ref5 = g();
  const a = _at(_ref5);
  const {
    [(eff('k'), 'at')]: _unused15
  } = _ref5;
}
{
  const f3 = _Array$from;
  const {
    [(eff('k'), 'from')]: _unused16
  } = Array;
}
{
  const f12 = _Array$from;
  const {
    [(eff('k'), 'self')]: _unused17
  } = _globalThis;
}
{
  const a = _at(src);
  const {
    [(eff('k'), 'w')]: {
      [(eff('k2'), 'at')]: _unused18
    }
  } = {
    w: src
  };
}
{
  const f = _Array$from;
  const {
    [(eff('k'), 'w')]: {
      [(eff('k2'), 'from')]: _unused19
    }
  } = {
    w: Array
  };
}
{
  const _ref6 = [1];
  const a = _atMaybeArray(_ref6);
  const {
    [(eff('k'), 'w')]: {
      at: _unused20
    }
  } = {
    w: _ref6
  };
}
{
  const _ref7 = [1];
  const f13 = _atMaybeArray(_ref7);
  const {
    [(eff('k'), 'w')]: {
      at: _unused21
    }
  } = {
    w: _ref7
  };
}
{
  const {
    [(eff('k'), 'w')]: {
      at: f19
    }
  } = {
    w: g()
  };
}
{
  const f20 = _atMaybeArray(arr);
  const {
    [(eff('k'), 'w')]: {
      at: _unused22
    }
  } = {
    w: arr
  };
}
{
  const f4 = _Array$from;
  const {
    [(eff('k'), 'w')]: _unused23
  } = {
    w: Array
  };
}
{
  const f4b = _Array$from;
  const {
    [(eff('k'), 'w')]: _unused24,
    z
  } = {
    w: Array,
    z: 1
  };
}
{
  const f = _Array$from;
  const {
    [(eff(), 'Array')]: {
      [(eff(), 'from')]: _unused25
    }
  } = _globalThis;
}
{
  const f = _Array$from;
  const {
    [(eff(), 'Array')]: _unused26
  } = _globalThis;
}
{
  const v2 = _valuesMaybeArray(_globalThis.Array.prototype);
  const {
    [(eff(), 'Array')]: _unused27
  } = _globalThis;
}