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
    Array: {
      from: {
        length: L
      } = fb
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
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
  const {
    ['w']: {
      Map: m
    }
  } = {
    w: {
      Map: _Map
    }
  };
  use(m);
}
{
  const {
    ['w']: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
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
  var _ref4;
  const _ref3 = [9],
    w7 = null == _ref3 ? _ref3[""] : (e7(), (_ref4 = _withMaybeArray(_ref3)) === void 0 ? dfltG() : _ref4),
    _ref5 = _ref3,
    t8 = null == _ref5 ? _ref5[""] : (e8(), _toSplicedMaybeArray(_ref5));
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
  const {
    [(eff('k'), 'Array')]: {
      [(eff('k2'), 'from')]: f
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
}
{
  const _ref7 = _globalThis,
    {
      [(eff('k'), 'Array')]: _ref6
    } = null == _ref7 ? _ref7[""] : _ref7,
    it16 = _getIteratorMethod(_ref6);
}
{
  const {
    [(eff('k'), 'Array')]: {
      from: f
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
}
{
  const {
    [(eff('k'), 'Array')]: {
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
    [(eff('k'), 'Array')]: {
      from: f11
    } = {}
  } = {
    Array: {
      from: _Array$from
    }
  };
}
{
  const {
    [(eff('k'), 'Array')]: {
      from: f15 = 1
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
}
{
  const {
    [(eff('k'), 'Array')]: {
      from: f5
    },
    z
  } = {
    Array: {
      from: _Array$from
    },
    z: _globalThis.z
  };
}
{
  const {
    [(eff('k'), 'Array')]: {
      from: f7,
      of: o7
    }
  } = {
    Array: {
      from: _Array$from,
      of: _Array$of
    }
  };
}
{
  const f8 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused,
    ...rest
  } = _globalThis;
}
{
  const _ref9 = _globalThis,
    {
      [(eff('k'), 'Array')]: _ref8
    } = null == _ref9 ? _ref9[""] : _ref9,
    {
      prototype: _ref10
    } = _ref8,
    f2 = _valuesMaybeArray(_ref10);
}
{
  const _ref11 = g(),
    a = null == _ref11 ? _ref11[""] : (eff('k'), _at(_ref11));
}
{
  const f3 = (eff('k'), _Array$from);
}
{
  const {
    [(eff('k'), 'self')]: {
      Array: {
        from: f12
      }
    }
  } = {
    self: {
      Array: {
        from: _Array$from
      }
    }
  };
}
{
  const _ref13 = {
      w: src
    },
    {
      [(eff('k'), 'w')]: _ref12
    } = null == _ref13 ? _ref13[""] : _ref13,
    a = null == _ref12 ? _ref12[""] : (eff('k2'), _at(_ref12));
}
{
  const {
    [(eff('k'), 'w')]: {
      [(eff('k2'), 'from')]: f
    }
  } = {
    w: {
      from: _Array$from
    }
  };
}
{
  const _ref15 = {
      w: [1]
    },
    {
      [(eff('k'), 'w')]: _ref14
    } = null == _ref15 ? _ref15[""] : _ref15,
    a = _atMaybeArray(_ref14);
}
{
  const _ref17 = {
      w: [1]
    },
    {
      [(eff('k'), 'w')]: _ref16
    } = null == _ref17 ? _ref17[""] : _ref17,
    f13 = _atMaybeArray(_ref16);
}
{
  const _ref19 = {
      w: g()
    },
    {
      [(eff('k'), 'w')]: _ref18
    } = null == _ref19 ? _ref19[""] : _ref19,
    f19 = _at(_ref18);
}
{
  const _ref21 = {
      w: arr
    },
    {
      [(eff('k'), 'w')]: _ref20
    } = null == _ref21 ? _ref21[""] : _ref21,
    f20 = _atMaybeArray(_ref20);
}
{
  const {
    [(eff('k'), 'w')]: {
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
    [(eff('k'), 'w')]: {
      from: f4b
    },
    z
  } = {
    w: {
      from: _Array$from
    },
    z: 1
  };
}
{
  const {
    [(eff(), 'Array')]: {
      [(eff(), 'from')]: f
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
}
{
  const {
    [(eff(), 'Array')]: {
      from: f
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
}
{
  const _ref23 = _globalThis,
    {
      [(eff(), 'Array')]: _ref22
    } = null == _ref23 ? _ref23[""] : _ref23,
    {
      prototype: _ref24
    } = _ref22,
    v2 = _valuesMaybeArray(_ref24);
}