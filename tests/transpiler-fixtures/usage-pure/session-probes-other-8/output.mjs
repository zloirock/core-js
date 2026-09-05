import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 8:
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
  const _ref = [1];
  const a4 = _atMaybeArray(_ref);
  const {
    w: {
      at: _unused
    },
    ...r
  } = {
    w: _ref
  };
}
{
  const _ref2 = g();
  const f21 = _at(_ref2);
  const {
    w: {
      at: _unused2
    },
    ...r
  } = {
    w: _ref2
  };
}
{
  const _ref3 = [1];
  const f22 = _atMaybeArray(_ref3);
  const {
    w: {
      at: _unused3
    },
    ...r
  } = {
    w: _ref3
  };
}
{
  const _ref4 = [1, 2];
  const m = _atMaybeArray(_ref4);
  const {
    w: {
      at: _unused4
    }
  } = {
    ...spread,
    w: _ref4
  };
  use(m);
}
{
  const m = _atMaybeArray(arr);
  const {
    w: {
      at: _unused5
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
  const _ref5 = [1, 2];
  const m = _atMaybeArray(_ref5);
  const {
    w: {
      at: _unused6
    },
    ...rest
  } = {
    w: _ref5,
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
  const _ref6 = (mark(), arr);
  const m = _atMaybeArray(_ref6);
  const {
    w: {
      at: _unused7
    },
    z
  } = {
    w: _ref6,
    z: 1
  };
  use(m, z);
}
{
  const _ref7 = [1, 2];
  const m = _atMaybeArray(_ref7);
  const {
    w: {
      at: _unused8
    },
    z
  } = {
    w: _ref7,
    z: 1
  };
  use(m, z);
}
{
  const _ref8 = [eff()];
  const m = _atMaybeArray(_ref8);
  const {
    w: {
      at: _unused9
    },
    z
  } = {
    w: _ref8,
    z: 1
  };
  use(m, z);
}
{
  const _ref9 = c ? a : b;
  const m = _at(_ref9);
  const {
    w: {
      at: _unused10
    },
    z
  } = {
    w: _ref9,
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
  const _ref10 = obj.p;
  const m = _at(_ref10);
  const {
    w: {
      at: _unused11
    },
    z
  } = {
    w: _ref10,
    z: 1
  };
  use(m, z);
}
{
  var _ref11;
  const {
    w: {
      at: _unused12
    },
    z
  } = {
    z: tick('z', 1),
    w: _ref11 = tick('w', arr)
  };
  const m = _at(_ref11);
  use(m, z);
}
{
  const entries = _Object$entries;
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
      return pick ? Array : userObj;
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
  const f = _Array$from;
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: Array,
    ...o
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