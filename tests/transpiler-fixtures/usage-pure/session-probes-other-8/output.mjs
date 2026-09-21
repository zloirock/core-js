import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// Nested literal containers preserve sibling effects and receiver uncertainty.
// Object rest keeps instance slots native; proven static leaves receive their pure entries.
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
    w: {
      at: a
    }
  } = {
    w: [1],
    ...o
  };
}
{
  const a1 = _atMaybeArray([1]);
}
{
  const {
    w: {
      at: a4
    },
    ...r
  } = {
    w: [1]
  };
}
{
  const {
    w: {
      at: f21
    },
    ...r
  } = {
    w: g()
  };
}
{
  const {
    w: {
      at: f22
    },
    ...r
  } = {
    w: [1]
  };
}
{
  const _ref = [1, 2];
  const m = _atMaybeArray(_ref);
  const {
    w: {
      at: _unused
    }
  } = {
    ...spread,
    w: _ref
  };
  use(m);
}
{
  const m = _atMaybeArray(arr);
  const {
    w: {
      at: _unused2
    }
  } = {
    ...spread,
    w: arr
  };
  use(m);
}
{
  const m = _atMaybeArray((mark(), [1, 2]));
  use(m);
}
{
  const m = _atMaybeArray((mark(), arr));
  use(m);
}
{
  const m = _atMaybeArray((_structuredClone(x), arr));
  use(m);
}
{
  const m = _atMaybeArray((_at(x).call(x, 0), arr));
  use(m);
}
{
  const m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const {
    w: {
      at: m
    }
  } = {
    w: eff()
  };
  use(m);
}
{
  const {
    w: {
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
  const {
    w: {
      at: m
    },
    ...rest
  } = {
    w: eff(),
    z: 1
  };
  use(m, rest);
}
{
  const _ref2 = {
    w: (mark(), arr),
    z: 1
  };
  const m = _atMaybeArray(_ref2.w);
  const {
    z
  } = _ref2;
  use(m, z);
}
{
  const _ref3 = {
    w: [1, 2],
    z: 1
  };
  const m = _atMaybeArray(_ref3.w);
  const {
    z
  } = _ref3;
  use(m, z);
}
{
  const _ref4 = {
    w: [eff()],
    z: 1
  };
  const m = _atMaybeArray(_ref4.w);
  const {
    z
  } = _ref4;
  use(m, z);
}
{
  const _ref5 = {
    w: c ? a : b,
    z: 1
  };
  const m = _at(_ref5.w);
  const {
    z
  } = _ref5;
  use(m, z);
}
{
  const {
    w: {
      at: m
    },
    z
  } = {
    w: eff() ?? [],
    z: 1
  };
  use(m, z);
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
    },
    q = 2;
  use(m, z, q);
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
  use(m, z);
}
{
  const _ref6 = {
    w: obj.p,
    z: 1
  };
  const m = _at(_ref6.w);
  const {
    z
  } = _ref6;
  use(m, z);
}
{
  const _ref7 = {
    z: tick('z', 1),
    w: tick('w', arr)
  };
  const m = _at(_ref7.w);
  const {
    z
  } = _ref7;
  use(m, z);
}
{
  const {
    w: {
      entries
    }
  } = {
    w: {
      entries: _Object$entries
    }
  };
  entries;
}
{
  const {
    w: {
      from: f
    } = {}
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  };
}
{
  const {
    w: {
      from: f
    } = {}
  } = {
    w: pick ? undefined : userObj
  };
  _pushMaybeArray(log).call(log, typeof f);
}
{
  const {
    w: {
      from: f
    }
  } = {
    ...more,
    w: pick ? {
      from: _Array$from
    } : userObj
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    get w() {
      return pick ? {
        from: _Array$from
      } : userObj;
    }
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: 0 ? {
      from: _Array$from
    } : userObj
  };
  _pushMaybeArray(log).call(log, f());
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: {
      from: _Array$from
    }
  };
}
{
  const {
      w: _ref8
    } = {
      w: Array,
      ...o
    },
    f = _ref8 === Array ? _Array$from : _ref8.from;
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  };
  _pushMaybeArray(log).call(log, f === _Array$from);
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj,
    ...more
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj,
    ...rest
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj,
    [k()]: 1
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj,
    [k]: 1
  };
}