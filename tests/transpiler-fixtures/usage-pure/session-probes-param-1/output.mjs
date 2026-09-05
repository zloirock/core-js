import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// probe corpus of the defense cycles over the destructure wrappers, family "param", part 1:
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
  class C {
    x = (({
      from
    }) => from)(id(Array));
  }
}
{
  class K {
    f = (([{
      y: {
        at: a
      }
    }]) => a)([nb]);
  }
}
{
  const boundKey = 'w';
  const viaBoundKeyIife = (({
    [boundKey]: {
      at: m
    }
  }) => m)({
    w: {
      at: _atMaybeArray([1, 2])
    }
  });
  use(viaBoundKeyIife);
}
{
  const boundKey = 'w';
  function boundKeyParam({
    [boundKey]: {
      Map: v
    }
  } = {
    w: {
      Map: _Map
    }
  }) {
    return v;
  }
  use(boundKeyParam());
}
{
  const f = (idd(Array), _Array$from);
  function idd(x) {
    _pushMaybeArray(log).call(log, x);
    return x;
  }
}
{
  const nb = {
    y: [1]
  };
  function g([{
    y: {
      at: a
    }
  }] = [nb]) {
    return a;
  }
}
{
  const order = [];
  const eff = t => (_pushMaybeArray(order).call(order, t), t);
  const f1 = _Array$from;
  const {
    [(eff('k'), 'Array')]: _unused
  } = _globalThis;
}
{
  const order = [];
  const eff = t => (_pushMaybeArray(order).call(order, t), t);
  const f2 = _valuesMaybeArray(_globalThis.Array.prototype);
  const {
    [(eff('k'), 'Array')]: _unused2
  } = _globalThis;
}
{
  const order = [];
  const eff = t => (_pushMaybeArray(order).call(order, t), t);
  const f4 = _Array$from;
  const {
    [(eff('k'), 'w')]: _unused3
  } = {
    w: Array
  };
}
{
  const order = [];
  function eff(t) {
    _pushMaybeArray(order).call(order, t);
    return t;
  }
  const _ref = [1, 2],
    {
      [(eff('k'), 'at')]: _unused4,
      z
    } = _ref,
    a = _atMaybeArray(_ref);
}
{
  const q = _Object$hasOwn;
  function g([{
    y: {
      at: a
    }
  }] = [nb]) {
    return a;
  }
}
{
  const r = (([[{
    at
  }]]) => at)([[{
    at: _atMaybeArray([1, 2])
  }]]);
}
{
  const r = (([[{
    hasOwn
  }]]) => hasOwn)([[{
    hasOwn: _Object$hasOwn
  }]]);
}
{
  const r = (([{
    [_Symbol$iterator]: it
  }]) => it)([{
    [_Symbol$iterator]: _getIteratorMethod([1])
  }]);
}
{
  const r = (([{
    a: {
      hasOwn
    }
  }]) => hasOwn)([{
    a: {
      hasOwn: _Object$hasOwn
    }
  }]);
}
{
  const r = (([{
    at
  }, x]) => at)([{
    at: _atMaybeArray([1, 2])
  }, 0]);
}
{
  const r = (([{
    at
  }, {
    flat
  }]) => [at, flat])([{
    at: _atMaybeArray([1])
  }, {
    flat: _flatMaybeArray([[2]])
  }]);
}
{
  const r = (([{
    at
  }]) => at)(...[[{
    at: _atMaybeArray([1, 2])
  }]]);
}
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray([1, 2])
  }]);
}
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray([1, 2])
  }]);
}
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray(arr)
  }]);
}
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray(c ? [1] : [2])
  }]);
}
{
  const r = (([{
    at
  }]) => at)([eff()]);
}
{
  const r = (([{
    at
  }]) => at)([_globalThis.Array.prototype]);
}
{
  const r = (([{
    at: a = null
  }]) => a)([{
    at: _atMaybeArray([1])
  }]);
}
{
  const r = (([{
    from: f
  }] = [_Set]) => f)([pick ? {
    from: _Array$from
  } : userObj]);
}
{
  const r = (([{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj]) => f)();
}
{
  const r = (([{
    from: f
  }]) => f)(...[[pick ? {
    from: _Array$from
  } : userObj]]);
}
{
  const r = (([{
    from: f
  }]) => f)([pick ? {
    from: _Array$from
  } : userObj]);
}
{
  const r = (([{
    hasOwn
  }, {
    is
  }]) => [hasOwn, is])([{
    hasOwn: _Object$hasOwn
  }, {
    is: _Object$is
  }]);
}
{
  const r = (([{
    hasOwn
  }]) => hasOwn)([{
    hasOwn: _Object$hasOwn
  }]);
}
{
  const r = (([{
    hasOwn
  }]) => hasOwn)([c ? {
    hasOwn: _Object$hasOwn
  } : userObj]);
}
{
  const r = (({
    [_Symbol$iterator]: it
  }) => it)({
    [_Symbol$iterator]: _getIteratorMethod([1])
  });
}
{
  const r = (({
    a: [, {
      hasOwn
    }]
  }) => hasOwn)({
    a: [0, {
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    a: [[{
      hasOwn
    }]]
  }) => hasOwn)({
    a: [[{
      hasOwn: _Object$hasOwn
    }]]
  });
}
{
  const r = (({
    a: [{
      [_Symbol$iterator]: i1
    }],
    b: [{
      [_Symbol$iterator]: i2
    }]
  }) => [i1, i2])({
    a: [{
      [_Symbol$iterator]: _getIteratorMethod([1])
    }],
    b: [{
      [_Symbol$iterator]: _getIteratorMethod('s')
    }]
  });
}
{
  const r = (({
    a: [{
      at
    }]
  }) => at)({
    a: [{
      at: _atMaybeArray([1, 2])
    }]
  });
}
{
  const r = (({
    a: [{
      at
    }]
  }) => at)({
    a: [{
      at: _atMaybeArray([1])
    }]
  });
}
{
  const r = (({
    a: [{
      b: {
        hasOwn
      }
    }]
  }) => hasOwn)({
    a: [{
      b: {
        hasOwn: _Object$hasOwn
      }
    }]
  });
}
{
  const r = (({
    a: [{
      hasOwn
    }, {
      is
    }]
  }) => [hasOwn, is])({
    a: [{
      hasOwn: _Object$hasOwn
    }, {
      is: _Object$is
    }]
  });
}