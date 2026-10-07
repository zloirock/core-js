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
  var _ref;
  const _ref2 = [9],
    w7 = (e7(), (_ref = _withMaybeArray(_ref2)) === void 0 ? dfltF() : _ref);
  use(w7);
}
{
  const {
    [(e7(), 'with')]: w7 = dfltG()
  } = eff();
  w7();
}
{
  var _ref3;
  const _ref4 = [9],
    w7 = (e7(), (_ref3 = _withMaybeArray(_ref4)) === void 0 ? dfltG() : _ref3),
    t8 = (e8(), _toSplicedMaybeArray(_ref4));
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
  const {
      [(eff('k'), 'Array')]: _ref5
    } = _globalThis,
    it16 = _getIteratorMethod(_ref5);
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
  const f5 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused,
    z
  } = _globalThis;
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
    [(eff('k'), 'Array')]: _unused2,
    ...rest
  } = _globalThis;
}
{
  const {
    [(eff('k'), 'Array')]: _ref6
  } = _globalThis;
  const f2 = _valuesMaybeArray(_ref6.prototype);
}
{
  const _ref7 = g(),
    a = null == _ref7 ? _ref7[""] : (eff('k'), _at(_ref7));
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
  const {
      [(eff('k'), 'w')]: _ref8
    } = {
      w: src
    },
    a = null == _ref8 ? _ref8[""] : (eff('k2'), _at(_ref8));
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
  const {
      [(eff('k'), 'w')]: _ref9
    } = {
      w: [1]
    },
    a = _atMaybeArray(_ref9);
}
{
  const {
      [(eff('k'), 'w')]: _ref10
    } = {
      w: [1]
    },
    f13 = _atMaybeArray(_ref10);
}
{
  const {
      [(eff('k'), 'w')]: _ref11
    } = {
      w: g()
    },
    f19 = _at(_ref11);
}
{
  const {
      [(eff('k'), 'w')]: _ref12
    } = {
      w: arr
    },
    f20 = _atMaybeArray(_ref12);
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
  const {
    [(eff(), 'Array')]: _ref13
  } = _globalThis;
  const v2 = _valuesMaybeArray(_ref13.prototype);
}