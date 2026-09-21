import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
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
  for (const _ref2 of [[Object, [1]]]) {
    let values = _Object$values;
    let [{
      values: _unused
    }, _ref] = _ref2;
    let at = _atMaybeArray(_ref);
    [values, at];
  }
}
{
  for (const _ref3 of [{
    w() {
      return Object;
    }
  }, {
    w() {
      return Object;
    }
  }]) {
    let {
      w: {
        keys
      }
    } = _ref3;
    keys;
  }
}
{
  for (let [_ref4] = [r, eff()], _ref5 = _ref4, values = _values(_ref5.w), at = _at(_ref5.y);;) {
    [values, at];
    break;
  }
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const _ref6 = [1];
  const a = _atMaybeArray(_ref6);
  const [{
    [(eff('k'), 'w')]: _unused2
  }] = [{
    w: _ref6
  }];
}
{
  const _ref7 = [1, 2];
  const [{}] = [_ref7, ...rest];
  const at = _atMaybeArray(_ref7);
}
{
  let zLead = 1,
    values = _values(r.w),
    at = _at(r.y);
  [zLead, values, at];
}
{
  const [{}] = [r, eff('n')],
    values = _values(r.w),
    at = _at(r.y),
    zTail = 1;
  [values, at, zTail];
}
{
  const [{}] = [r, eff('n')],
    values = _values(r.w),
    at = _at(r.y),
    zTail = eff('t');
  [values, at, zTail];
}
{
  const zLead = eff('lead'),
    [{}] = [r, eff('n')],
    values = _values(r.w),
    at = _at(r.y);
  [zLead, values, at];
}
{
  const {
      prototype: _ref8
    } = _globalThis.Array,
    _ref9 = _ref8,
    a = null == _ref9 ? _ref9[""] : (eff('k2'), _atMaybeArray(_ref9));
}
{
  const {
      prototype: _ref10
    } = _globalThis.Array,
    _ref11 = _ref10,
    a = null == _ref11 ? _ref11[""] : (eff('k2'), _atMaybeArray(_ref11));
  _pushMaybeArray(log).call(log, a.call([3], 0));
}
{
  const {
    Array: {
      prototype: {
        [(eff('k2'), 'at')]: a
      }
    },
    ...r
  } = _globalThis;
}
{
  const _ref13 = {
      w: 'x'
    },
    {
      [(eff(), 'w')]: _ref12
    } = null == _ref13 ? _ref13[""] : _ref13,
    _ref14 = _ref12,
    a = null == _ref14 ? _ref14[""] : _atMaybeString(_ref14);
}
{
  const _ref16 = {
      w: 'str'
    },
    {
      [(eff(), 'w')]: _ref15
    } = null == _ref16 ? _ref16[""] : _ref16,
    _ref17 = _ref15,
    i3 = null == _ref17 ? _ref17[""] : _includesMaybeString(_ref17);
}
{
  const {
    w: [, {
      keys
    }]
  } = {
    w: [0, {
      keys: _Object$keys
    }]
  };
}
{
  const {
    w: {
      Array: {
        from: F = fb
      }
    },
    z
  } = {
    w: {
      Array: {
        from: _Array$from
      }
    },
    z: 1
  };
  F(z);
}
{
  const {
    w: {
      Map: m,
      keep
    },
    ...rest
  } = {
    w: {
      Map: _Map,
      keep: _globalThis.keep
    },
    z: 1
  };
  use(m, keep, rest);
}
{
  const {
    w: {
      at: m
    },
    z
  } = {
    w: eff(),
    z: 1
  };
  const {
    w: {
      keys: k
    },
    q
  } = {
    w: (eff(), {
      keys: _Object$keys
    }),
    q: 1
  };
  use(m, z, k, q);
}
{
  const {
    w: {
      at: m,
      keys: k
    },
    z
  } = {
    w: (eff(), {
      at: Object.at,
      keys: _Object$keys
    }),
    z: 1
  };
  use(m, k, z);
}
{
  const {
    w: {
      includes: i4
    },
    ...r
  } = {
    w: 'str'
  };
}
{
  const _ref18 = {
    w: {
      values: _Object$values
    },
    y: [1]
  };
  const {
    w: {
      values
    }
  } = _ref18;
  const at = _atMaybeArray(_ref18.y);
  [values, at];
}
{
  (x => (_pushMaybeArray(log).call(log, 'x'), x))(Array);
  const f = _Array$from;
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const {
    w: {
      keys: andHop
    },
    q: andQ
  } = {
    w: eff() && {
      keys: _Object$keys
    },
    q: 1
  };
  [andHop, andQ];
}
{
  const {
    Array: {
      of: {
        name: splitBesideStatic,
        foo: splitFoo
      },
      from: splitFrom
    }
  } = {
    Array: {
      of: {
        name: _nameMaybeFunction(_Array$of),
        foo: _Array$of.foo
      },
      from: _Array$from
    }
  };
  [splitBesideStatic, splitFoo, splitFrom];
}
{
  const {
    junk: defaultJunk,
    of: {
      name: defaultName,
      foo: defaultFoo
    } = {}
  } = {
    junk: Array.junk,
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  };
  [defaultJunk, defaultName, defaultFoo];
}
{
  const {
    Array: {
      of: {
        name: soleOrder
      },
      from: soleOrderFrom
    }
  } = {
    Array: {
      of: {
        name: _nameMaybeFunction(_Array$of)
      },
      from: _Array$from
    }
  };
  [soleOrder, soleOrderFrom];
}
{
  const {
    Array: {
      of: {
        name: soleResidual
      },
      junk: soleResidualJunk
    }
  } = {
    Array: {
      of: {
        name: _nameMaybeFunction(_Array$of)
      },
      junk: _globalThis.Array.junk
    }
  };
  [soleResidual, soleResidualJunk];
}
{
  const soleInstanceResidual = _atMaybeArray(_globalThis.Array.prototype);
  const {
    junk: soleInstanceJunk
  } = _globalThis.Array;
  [soleInstanceResidual, soleInstanceJunk];
}