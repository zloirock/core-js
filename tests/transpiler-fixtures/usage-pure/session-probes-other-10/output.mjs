import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Each block locks an independent destructuring assignment form.
// Computed keys, stored receiver values and sibling bindings keep their source order.
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
  var _ref2, _ref, _ref3;
  let f17;
  _ref = {
    w: [1]
  }, {
    [(eff('k'), 'w')]: _ref2
  } = null == _ref ? _ref[""] : _ref, _ref3 = _ref2, f17 = _atMaybeArray(_ref3), _ref3, _ref;
}
{
  var _ref4;
  let f3;
  ({
    w: _ref4
  } = {
    w: Array,
    ...o
  }), f3 = _ref4 === Array ? _Array$from : _ref4.from;
}
{
  let f4;
  var _unused;
  ({
    Array: _unused,
    ...r4
  } = _globalThis);
  f4 = _Array$from;
}
{
  let f9;
  ({
    [(eff('k'), 'Array')]: {
      from: f9
    }
  } = {
    Array: {
      from: _Array$from
    }
  });
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
  var _unused2;
  ({
    Array: _unused2,
    ...rest
  } = _globalThis);
  from = _Array$from;
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
    w: {
      Array: {
        from: hopSeq
      }
    }
  } = {
    w: (f(), g(), {
      Array: {
        from: _Array$from
      }
    })
  });
  use(hopSeq);
}
{
  let m, rest;
  var _unused3;
  m = _Map;
  ({
    Map: _unused3,
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
    w: {
      Map: _Map
    },
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
  ({
    w: [{
      entries: v
    }]
  } = {
    w: [{
      entries: _Object$entries
    }]
  });
}
{
  const _ref5 = eff();
  let values = _values(_ref5.w);
  let at = _at(_ref5.y);
  [values, at];
}
{
  let _ref6 = r ?? {};
  let values = _values(_ref6.w);
  let at = _at(_ref6.y);
  [values, at];
}
{
  let _ref7 = r;
  let values = _values(_ref7.w);
  let at = _at(_ref7.y);
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
  var _ref8;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref8 = o.data).call(_ref8, 0);
}
{
  var _ref9;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref9 = o[eff(), 'data']).call(_ref9, 0);
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
  } catch (_ref10) {
    let entries = _entries(_ref10.w);
    entries;
  }
}
{
  try {
    throw [r];
  } catch (_ref11) {
    let [_ref12] = _ref11;
    let _ref13 = _ref12.w;
    let values = _values(_ref13);
    let at = _at(_ref12.y);
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