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
// Each block locks an independent form: a destructuring assignment, declaration or catch parameter,
// or a computed member write.
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
  [,] = [(g(), arr)];
  e = _atMaybeArray(arr);
  use(e);
}
{
  var _ref;
  let e;
  [_ref] = [(g(), f())];
  e = _at(_ref);
  use(e);
}
{
  var _ref2;
  let e;
  [_ref2] = [(_at(x).call(x, 0), f())];
  e = _at(_ref2);
  use(e);
}
{
  var _ref3;
  let f17;
  ({
    [(eff('k'), 'w')]: _ref3
  } = {
    w: [1]
  }), f17 = _atMaybeArray(_ref3);
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
  var _unused;
  let f4;
  ({} = _globalThis), _globalThis.Array, f4 = _Array$from, {
    Array: _unused,
    ...r4
  } = _globalThis;
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
  var _unused2;
  let from, rest;
  ({} = _globalThis), _globalThis.Array, from = _Array$from, {
    Array: _unused2,
    ...rest
  } = _globalThis;
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
  var _ref5;
  let m;
  [_ref5] = [{
    w: (mark(), arr)
  }];
  m = _atMaybeArray(_ref5.w);
  use(m);
}
{
  var _ref6;
  let m;
  [_ref6] = [{
    w: (_at(x).call(x, 0), arr)
  }];
  m = _atMaybeArray(_ref6.w);
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
  var _ref7;
  let out, e;
  [_ref7] = [_flatMaybeArray((out = 1, arr)).call(arr)];
  e = _atMaybeArray(_ref7);
  use(e, out);
}
{
  let out, e;
  [,] = [(out = 1, arr)];
  e = _atMaybeArray(arr);
  use(e, out);
}
{
  var _ref8;
  let out, e;
  [_ref8] = [(out = 1, _flatMaybeArray(arr).call(arr))];
  e = _atMaybeArray(_ref8);
  use(e, out);
}
{
  var _ref9;
  let out, e;
  [_ref9] = [(out = 1, f())];
  e = _at(_ref9);
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
  let _ref10 = eff();
  let values = _values(_ref10.w);
  let at = _at(_ref10.y);
  [values, at];
}
{
  let _ref11 = r ?? {};
  let values = _values(_ref11.w);
  let at = _at(_ref11.y);
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
  var _ref12;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref12 = o.data).call(_ref12, 0);
}
{
  var _ref13;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref13 = o[eff(), 'data']).call(_ref13, 0);
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
  } catch (_ref14) {
    let entries = _entries(_ref14.w);
    entries;
  }
}
{
  try {
    throw [r];
  } catch (_ref15) {
    let [_ref16] = _ref15;
    let values = _values(_ref16.w);
    let at = _at(_ref16.y);
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