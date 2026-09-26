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
  for (const _ref3 of [[Object, [1]]]) {
    let [_ref, _ref2] = _ref3;
    let {
      values: _unused
    } = _ref;
    let values = _Object$values;
    let at = _atMaybeArray(_ref2);
    [values, at];
  }
}
{
  for (const _ref4 of [{
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
    } = _ref4;
    keys;
  }
}
{
  for (let [_ref5] = [r, eff()], _ref6 = _ref5, values = _values(_ref6.w), at = _at(_ref6.y);;) {
    [values, at];
    break;
  }
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const [_ref7] = [{
    w: [1]
  }];
  const _ref9 = _ref7;
  const {
    [(eff('k'), 'w')]: _ref8
  } = null == _ref9 ? _ref9[""] : _ref9;
  const a = _atMaybeArray(_ref8);
}
{
  const [_ref10] = [[1, 2], ...rest];
  const at = _atMaybeArray(_ref10);
}
{
  let zLead = 1,
    values = _values(r.w),
    at = _at(r.y);
  [zLead, values, at];
}
{
  const [_ref11] = [r, eff('n')],
    _ref12 = _ref11,
    values = _values(_ref12.w),
    at = _at(_ref12.y),
    zTail = 1;
  [values, at, zTail];
}
{
  const [_ref13] = [r, eff('n')],
    _ref14 = _ref13,
    values = _values(_ref14.w),
    at = _at(_ref14.y),
    zTail = eff('t');
  [values, at, zTail];
}
{
  const zLead = eff('lead'),
    [_ref15] = [r, eff('n')],
    _ref16 = _ref15,
    values = _values(_ref16.w),
    at = _at(_ref16.y);
  [zLead, values, at];
}
{
  const {
      prototype: _ref17
    } = _globalThis.Array,
    _ref18 = _ref17,
    a = null == _ref18 ? _ref18[""] : (eff('k2'), _atMaybeArray(_ref18));
}
{
  const {
      prototype: _ref19
    } = _globalThis.Array,
    _ref20 = _ref19,
    a = null == _ref20 ? _ref20[""] : (eff('k2'), _atMaybeArray(_ref20));
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
  const _ref22 = {
      w: 'x'
    },
    {
      [(eff(), 'w')]: _ref21
    } = null == _ref22 ? _ref22[""] : _ref22,
    _ref23 = _ref21,
    a = null == _ref23 ? _ref23[""] : _atMaybeString(_ref23);
}
{
  const _ref25 = {
      w: 'str'
    },
    {
      [(eff(), 'w')]: _ref24
    } = null == _ref25 ? _ref25[""] : _ref25,
    _ref26 = _ref24,
    i3 = null == _ref26 ? _ref26[""] : _includesMaybeString(_ref26);
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
  const _ref27 = {
    w: {
      values: _Object$values
    },
    y: [1]
  };
  const {
    w: {
      values
    }
  } = _ref27;
  const at = _atMaybeArray(_ref27.y);
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