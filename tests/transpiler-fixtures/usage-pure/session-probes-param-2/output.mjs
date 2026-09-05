import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// probe corpus of the defense cycles over the destructure wrappers, family "param", part 2:
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
  const r = (({
    a: [{
      hasOwn
    }]
  }) => hasOwn)({
    a: [{
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    a: [{
      hasOwn
    }]
  }) => hasOwn)({
    a: [c ? {
      hasOwn: _Object$hasOwn
    } : userObj]
  });
}
{
  const r = (({
    a: [{
      hasOwn
    }],
    b: [{
      is
    }]
  }) => [hasOwn, is])({
    a: [{
      hasOwn: _Object$hasOwn
    }],
    b: [{
      is: _Object$is
    }]
  });
}
{
  const r = (({
    a: {
      [_Symbol$iterator]: it
    }
  }) => it)({
    a: {
      [_Symbol$iterator]: _getIteratorMethod([1])
    }
  });
}
{
  const r = (({
    a: {
      [_Symbol$iterator]: it,
      at
    }
  }) => [it, at])({
    a: {
      [_Symbol$iterator]: _getIteratorMethod([1]),
      at: _atMaybeArray([1])
    }
  });
}
{
  const r = (({
    a: {
      at
    }
  }) => at)({
    a: {
      at: _atMaybeArray([1, 2])
    }
  });
}
{
  const r = (({
    a: {
      b: {
        hasOwn
      }
    }
  }) => hasOwn)({
    a: {
      b: {
        hasOwn: _Object$hasOwn
      }
    }
  });
}
{
  const r = (({
    a: {
      hasOwn
    }
  }) => hasOwn)({
    a: {
      hasOwn: _Object$hasOwn
    }
  });
}
{
  const r = (({
    a: {
      hasOwn
    },
    b: {
      is
    }
  }) => [hasOwn, is])(_globalThis.x);
}
{
  const r = (({
    a: {
      hasOwn
    },
    b: {
      is
    }
  }) => [hasOwn, is])({
    a: {
      hasOwn: _Object$hasOwn
    },
    b: {
      is: _Object$is
    }
  });
}
{
  const r = (({
    a: {
      hasOwn
    },
    b: {
      is
    }
  }) => [hasOwn, is])({
    a: {
      hasOwn: _Object$hasOwn
    },
    b: userObj
  });
}
{
  const r = (({
    a: {
      hasOwn
    },
    b: {
      is
    }
  }) => [hasOwn, is])({
    a: c ? {
      hasOwn: _Object$hasOwn
    } : userObj,
    b: {
      is: _Object$is
    }
  });
}
{
  const r = (({
    a: {
      hasOwn,
      is
    }
  }) => [hasOwn, is])({
    a: {
      hasOwn: _Object$hasOwn,
      is: _Object$is
    }
  });
}
{
  const r = (({
    at
  }) => at)((0, {
    at: _atMaybeArray([1, 2])
  }));
}
{
  const r = (({
    at
  }) => at)((log(), {
    at: _atMaybeArray([1, 2])
  }));
}
{
  const r = (({
    at
  }) => at)(...[{
    at: _atMaybeArray([1, 2])
  }]);
}
{
  const r = (({
    at
  }) => at)({
    at: _atMaybeArray([1, 2])
  });
}
{
  const r = (({
    at
  }, x) => at)(...[{
    at: _atMaybeArray([1, 2])
  }, 0]);
}
{
  const r = (({
    from
  }) => from)(...[{
    from: _Array$from
  }]);
}
{
  const r = (({
    from
  }) => from)(id(Array));
}
{
  const r = (({
    w: [{
      [_Symbol$iterator]: it,
      hasOwn
    }]
  }) => [it, hasOwn])({
    w: [{
      [_Symbol$iterator]: _getIteratorMethod(Object),
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    } = {}]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }, ...rest]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }, 1]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }] = []
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    get w() {
      return [{
        hasOwn: _Object$hasOwn
      }];
    }
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [...rest, Object]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }, eff()]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [Object],
    w: [userObj]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [eff(), Object]
  });
}
{
  const v = (({
    at
  }) => at)(...[mark('e', [0])]);
}
{
  const v = (({
    at
  }) => at)(mark('e', [0]));
}
{
  const v = (({
    at
  }, x) => at)(mark('e', [0]), 1);
}
{
  const v = _Promise$resolve(...[[1, 2]]);
  v.then(a => _at(a).call(a, 0));
}
{
  const viaIife = (({
    at
  }, x) => [at.call([8, 9], -1), x])(...[mark('e', [0]), mark('f', 1)]);
}
{
  function f() {
    eff('n');
    const values = _values(r.w);
    const at = _at(r.y);
    return [values, at];
  }
}
{
  function f(a = [1]) {
    return a;
  }
  const v = f(...[[1, 2]]);
  _atMaybeArray(v).call(v, 0);
}
{
  function f(a = [1]) {
    return a;
  }
  const v = f(...rest);
  _at(v).call(v, 0);
}