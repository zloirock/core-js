import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Set from "@core-js/pure/actual/set";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 7:
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
    at: m
  } = {
    ...spread,
    at: 1
  };
  use(m);
}
{
  const {
    at: m,
    z
  } = (mark(), obj);
  use(m, z);
}
{
  const {
      at: m,
      z
    } = eff(),
    q = 2;
  use(m, z, q);
}
{
  const {
      at: s,
      ...r
    } = eff(),
    q = 2;
  s(r, q);
}
{
  const {
    from
  } = id(Array) ?? {};
}
{
  const {
    from
  } = pick ? id(Array) : _Set;
}
{
  const {
    from: f
  } = id(Array);
}
{
  const {
    from: f
  } = pick ? {
    from: _Array$from
  } : _Set;
}
{
  const {
    from: f
  } = pick ? {
    from: _Array$from
  } : userObj;
}
{
  const {
    from: f
  } = pid(Array);
}
{
  const is = _Object$is;
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  [is, values, at];
}
{
  const {
    length: {
      from: f
    }
  } = [pick ? Array : userObj];
}
{
  const {
    p: {
      a,
      w: {
        at: m
      }
    }
  } = {
    p: {
      a: g(),
      w: eff()
    }
  };
  use(a, m);
}
{
  const {
    p: {
      w: {
        at: m
      }
    },
    z
  } = {
    p: {
      w: eff()
    },
    z: 1
  };
  use(m, z);
}
{
  const _ref = {
      q: (eff.push('se'), 1),
      p: holder.p
    },
    {
      q: qq
    } = _ref,
    {
      p: _ref2
    } = _ref,
    _ref3 = _ref2,
    _ref4 = _ref3,
    m2 = null == _ref4 ? _ref4[""] : (eff.push('key'), _flatMaybeArray(_ref4)),
    {
      other2
    } = _ref3;
  use(qq, m2, other2);
}
{
  const {
      root: {
        Array: _ref5
      }
    } = {
      root: {
        Array,
        ...more
      }
    },
    f = _ref5 === Array ? _Array$from : _ref5.from;
}
{
  const at = _atMaybeArray([1]);
}
{
  const m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const {
    w: [{
      from: f
    }]
  } = {
    w: [pick ? {
      from: _Array$from
    } : userObj]
  };
}
{
  const {
    w: [{
      from: f
    }]
  } = {
    w: [pick ? {
      from: _Array$from
    } : userObj]
  };
  _pushMaybeArray(log).call(log, f === _Array$from);
}
{
  const hasOwn = _Object$hasOwn;
}
{
  const {
    w: [{
      hasOwn
    }]
  } = {
    w: [Object],
    ...more
  };
}
{
  const {
    w: [{
      hasOwn
    }]
  } = {
    w: [c ? {
      hasOwn: _Object$hasOwn
    } : userObj]
  };
}
{
  const {
    w: {
      Array: {
        of: m
      }
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, rest);
}
{
  const _ref6 = {
    z: 1,
    w: tick('w', _globalThis)
  };
  const m = _at(_ref6.w.Array.prototype);
  const {
    z
  } = _ref6;
  use(m, z);
}
{
  const _ref7 = {
    z: tick('z', 1),
    w: tick('w', _globalThis)
  };
  const m = _at(_ref7.w.Array.prototype);
  const {
    z
  } = _ref7;
  use(m, z);
}
{
  const _ref8 = {
    w: _globalThis,
    z: 5
  };
  const besideSibling = _mapMaybeArray(_ref8.w.Array.prototype);
  const {
    z
  } = _ref8;
  use(besideSibling, z);
}
{
  const M = _Map;
  M();
}
{
  const m = _Map;
  const {
    w: {
      Map: _unused
    }
  } = {
    ...extra,
    w: _globalThis
  };
  use(m);
}
{
  const m = _Map;
  use(m);
}
{
  const {
    w: {
      Map: m
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, rest);
}
{
  const {
    w: {
      Map: m
    },
    z
  } = {
    w: eff(),
    z: 1
  };
  use(m, z);
}
{
  const {
    w: {
      Map: m,
      Set: s
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, s, rest);
}
{
  const {
    w: {
      [(eff('k2'), 'from')]: f
    },
    ...r
  } = {
    w: Array
  };
}
{
  const {
    w: {
      [_Symbol$iterator]: it
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(it, rest);
}
{
  const a = _atMaybeArray([1, 2]);
}
{
  const a = _atMaybeArray([1]);
}