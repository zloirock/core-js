import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 10:
// every block is one probed form, self-contained over the header bindings, locked on both legs
// The computed assignment has equivalent sequence/statement grouping held in the unplugin sidecar.
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
  let e;
  [(g(), arr)];
  e = _atMaybeArray(arr);
  use(e);
}
{
  let e;
  e = _at((g(), f()));
  use(e);
}
{
  let e;
  e = _at((_at(x).call(x, 0), f()));
  use(e);
}
{
  var _ref2, _ref;
  let f17;
  _ref = {
    w: [1]
  }, {
    [(eff('k'), 'w')]: _ref2
  } = null == _ref ? _ref[""] : _ref, f17 = _atMaybeArray(_ref2), _ref;
}
{
  var _ref3;
  let f3;
  ({
    w: _ref3
  } = {
    w: Array,
    ...o
  }), f3 = _ref3 === Array ? _Array$from : _ref3.from;
}
{
  let f4;
  ({
    Array: {
      from: f4
    },
    ...r4
  } = _globalThis);
}
{
  let f9;
  var _unused;
  ({
    [(eff('k'), 'Array')]: _unused
  } = _globalThis);
  f9 = _Array$from;
}
{
  let f;
  ({
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  });
}
{
  let f;
  [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  let from, rest;
  ({
    Array: {
      from
    },
    ...rest
  } = _globalThis);
  use(from, rest);
}
{
  let from;
  ({
    from
  } = id(Array));
}
{
  let hopSeq;
  ({
    w: (f(), g(), _globalThis)
  });
  hopSeq = _Array$from;
  use(hopSeq);
}
{
  let m, rest;
  ({
    Map: m,
    ...rest
  } = _globalThis);
  use(m, rest);
}
{
  let m, rest;
  ({
    w: {
      Map: m
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  });
  use(m, rest);
}
{
  let m, rest;
  ({
    w: {
      at: m
    },
    ...rest
  } = {
    w: [1, 2],
    z: 1
  });
  use(m, rest);
}
{
  let m, z;
  ({
    w: {
      at: m
    },
    z
  } = {
    w: eff(),
    z: 1
  });
  use(m, z);
}
{
  let m;
  [{
    w: (mark(), arr)
  }];
  m = _atMaybeArray(arr);
  use(m);
}
{
  let m;
  [{
    w: (_at(x).call(x, 0), arr)
  }];
  m = _atMaybeArray(arr);
  use(m);
}
{
  let m;
  ({
    w: (mark(), arr)
  });
  m = _atMaybeArray(arr);
  use(m);
}
{
  let m;
  ({
    w: {
      at: m
    }
  } = {
    w: eff()
  });
  use(m);
}
{
  let out, e;
  e = _atMaybeArray((out = 1, _flatMaybeArray(arr).call(arr)));
  use(e, out);
}
{
  let out, e;
  [(out = 1, arr)];
  e = _atMaybeArray(arr);
  use(e, out);
}
{
  let out, e;
  e = _atMaybeArray((out = 1, _flatMaybeArray(arr).call(arr)));
  use(e, out);
}
{
  let out, e;
  e = _at((out = 1, f()));
  use(e, out);
}
{
  let v, a;
  ({
    w: {
      values: v
    },
    y: {
      at: a
    }
  } = r);
  [v, a];
}
{
  let v;
  v = _Object$entries;
}
{
  const _ref4 = eff();
  let values = _values(_ref4.w);
  let at = _at(_ref4.y);
  [values, at];
}
{
  let _ref5 = r ?? {};
  let values = _values(_ref5.w);
  let at = _at(_ref5.y);
  [values, at];
}
{
  let _ref6 = r;
  let values = _values(_ref6.w);
  let at = _at(_ref6.y);
  [values, at];
}
{
  let at = _at(r.y);
  let z = 1;
  [at, z];
}
{
  let at = _at(r.y);
  at;
}
{
  var _ref7;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref7 = o.data).call(_ref7, 0);
}
{
  var _ref8;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref8 = o[eff(), 'data']).call(_ref8, 0);
}
{
  try {
    throw 0;
  } catch (_r) {
    let keys = _keys(_r.w);
    keys;
  }
}
{
  try {
    throw 0;
  } catch ({
    [(eff('k'), 'Array')]: {
      from: f
    } = _globalThis
  }) {
    f;
  }
}
{
  try {
    throw 0;
  } catch (_ref9) {
    let entries = _entries(_ref9.w);
    entries;
  }
}
{
  try {
    throw [r];
  } catch (_ref10) {
    let [_ref11] = _ref10;
    let _ref12 = _ref11.w;
    let values = _values(_ref12);
    let at = _at(_ref11.y);
    [values, at];
  }
}
{
  try {
    throw {
      w: Array
    };
  } catch ({
    [(eff('k'), 'w')]: {
      from: f
    }
  }) {
    f;
  }
}
{
  try {
    throw {
      w: Array
    };
  } catch ({
    [(eff('k'), 'w')]: {
      from: f
    }
  }) {
    _pushMaybeArray(log).call(log, f === _Array$from);
  }
}