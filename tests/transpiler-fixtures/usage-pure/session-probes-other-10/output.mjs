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
  var _ref;
  let e;
  [_ref] = [(g(), arr)];
  e = _atMaybeArray(_ref);
  use(e);
}
{
  var _ref2;
  let e;
  [_ref2] = [(g(), f())];
  e = _at(_ref2);
  use(e);
}
{
  var _ref3;
  let e;
  [_ref3] = [(_at(x).call(x, 0), f())];
  e = _at(_ref3);
  use(e);
}
{
  var _ref5, _ref4, _ref6;
  let f17;
  _ref4 = {
    w: [1]
  }, {
    [(eff('k'), 'w')]: _ref5
  } = null == _ref4 ? _ref4[""] : _ref4, _ref6 = _ref5, f17 = _atMaybeArray(_ref6), _ref6, _ref4;
}
{
  var _ref7;
  let f3;
  ({
    w: _ref7
  } = {
    w: Array,
    ...o
  }), f3 = _ref7 === Array ? _Array$from : _ref7.from;
}
{
  var _ref8, _ref9, _unused;
  let f4;
  _ref8 = _globalThis, _ref9 = _ref8["Array"], f4 = _Array$from, _ref9, {
    Array: _unused,
    ...r4
  } = _ref8, _ref8;
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
  var _ref10, _ref11, _unused2;
  let from, rest;
  _ref10 = _globalThis, _ref11 = _ref10["Array"], from = _Array$from, _ref11, {
    Array: _unused2,
    ...rest
  } = _ref10, _ref10;
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
  var _ref12;
  let m;
  [_ref12] = [{
    w: (mark(), arr)
  }];
  m = _atMaybeArray(_ref12.w);
  use(m);
}
{
  var _ref13;
  let m;
  [_ref13] = [{
    w: (_at(x).call(x, 0), arr)
  }];
  m = _atMaybeArray(_ref13.w);
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
  var _ref14;
  let out, e;
  [_ref14] = [(out = 1, _flatMaybeArray(arr).call(arr))];
  e = _atMaybeArray(_ref14);
  use(e, out);
}
{
  var _ref15;
  let out, e;
  [_ref15] = [(out = 1, arr)];
  e = _atMaybeArray(_ref15);
  use(e, out);
}
{
  var _ref16;
  let out, e;
  [_ref16] = [(out = 1, _flatMaybeArray(arr).call(arr))];
  e = _atMaybeArray(_ref16);
  use(e, out);
}
{
  var _ref17;
  let out, e;
  [_ref17] = [(out = 1, f())];
  e = _at(_ref17);
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
  let _ref18 = eff();
  let values = _values(_ref18.w);
  let at = _at(_ref18.y);
  [values, at];
}
{
  let _ref19 = r ?? {};
  let values = _values(_ref19.w);
  let at = _at(_ref19.y);
  [values, at];
}
{
  let _ref20 = r;
  let values = _values(_ref20.w);
  let at = _at(_ref20.y);
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
  var _ref21;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref21 = o.data).call(_ref21, 0);
}
{
  var _ref22;
  o[eff(), 'data'] = 'str';
  const r2 = _at(_ref22 = o[eff(), 'data']).call(_ref22, 0);
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
  } catch (_ref23) {
    let entries = _entries(_ref23.w);
    entries;
  }
}
{
  try {
    throw [r];
  } catch (_ref24) {
    let [_ref25] = _ref24;
    let _ref26 = _ref25.w;
    let values = _values(_ref26);
    let at = _at(_ref25.y);
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