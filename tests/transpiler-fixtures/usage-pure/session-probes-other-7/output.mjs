import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Set from "@core-js/pure/actual/set";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
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
  var _ref;
  const {
    q: qq,
    p: {
      [(eff.push('key'), 'flat')]: _unused,
      other2
    }
  } = {
    q: (eff.push('se'), 1),
    p: _ref = holder.p
  };
  const m2 = _flatMaybeArray(_ref);
  use(qq, m2, other2);
}
{
  const {
    root: {
      Array: {
        from: f
      }
    }
  } = {
    root: {
      Array,
      ...more
    }
  };
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
  const m = _Array$of;
  const {
    w: _unused2,
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
      Array: {
        prototype: {
          at: m
        }
      }
    },
    z
  } = {
    z: 1,
    w: tick('w', _globalThis)
  };
  use(m, z);
}
{
  const {
    w: {
      Array: {
        prototype: {
          at: m
        }
      }
    },
    z
  } = {
    z: tick('z', 1),
    w: tick('w', _globalThis)
  };
  use(m, z);
}
{
  const besideSibling = _mapMaybeArray(_globalThis.Array.prototype);
  const {
    z
  } = {
    w: _globalThis,
    z: 5
  };
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
      Map: _unused3
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
  const m = _Map;
  const {
    w: _unused4,
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
  const m = _Map;
  const s = _Set;
  const {
    w: _unused5,
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, s, rest);
}
{
  const f = _Array$from;
  const {
    w: {
      [(eff('k2'), 'from')]: _unused6
    },
    ...r
  } = {
    w: Array
  };
}
{
  const it = _getIteratorMethod(_globalThis);
  const {
    w: {
      [_Symbol$iterator]: _unused7
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