import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 10:
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
  let f17;
  var _unused;
  ({
    [(eff('k'), 'w')]: _unused
  } = {
    w: [1]
  });
  f17 = _atMaybeArray([1]);
}
{
  let f3;
  ({
    w: {
      from: f3
    }
  } = {
    w: Array,
    ...o
  });
}
{
  let f4;
  var _unused2;
  ({
    Array: _unused2,
    ...r4
  } = _globalThis);
  f4 = _Array$from;
}
{
  let f9;
  var _unused3;
  ({
    [(eff('k'), 'Array')]: _unused3
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
  var _unused4;
  ({
    Array: _unused4,
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
    w: (f(), g(), _globalThis)
  });
  hopSeq = _Array$from;
  use(hopSeq);
}
{
  let m, rest;
  var _unused5;
  m = _Map;
  ({
    Map: _unused5,
    ...rest
  } = _globalThis);
  use(m, rest);
}
{
  let m, rest;
  var _unused6;
  ({
    w: _unused6,
    ...rest
  } = {
    w: _globalThis,
    z: 1
  });
  m = _Map;
  use(m, rest);
}
{
  let m, rest;
  var _unused7;
  ({
    w: _unused7,
    ...rest
  } = {
    w: [1, 2],
    z: 1
  });
  m = _atMaybeArray([1, 2]);
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
  const _ref = eff();
  let values = _values(_ref.w);
  let at = _at(_ref.y);
  [values, at];
}
{
  let {
    w: {
      values
    },
    y: {
      at
    }
  } = r ?? {};
  [values, at];
}
{
  let values = _values(r.w);
  let at = _at(r.y);
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
  var _ref2;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref2 = o.data).call(_ref2, 0);
}
{
  var _ref3;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref3 = o[eff(), 'data']).call(_ref3, 0);
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
  } catch (_ref4) {
    let entries = _entries(_ref4.w);
    entries;
  }
}
{
  try {
    throw [r];
  } catch (_ref5) {
    let [_ref6] = _ref5;
    let _ref7 = _ref6.w;
    let values = _values(_ref7);
    let {
      values: _unused8
    } = _ref7;
    let {
      y: {
        at
      }
    } = _ref6;
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