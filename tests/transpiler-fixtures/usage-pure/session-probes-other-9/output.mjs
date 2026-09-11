import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 9:
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
      from: f
    }
  } = {
    w: pick ? Array : userObj,
    get w() {
      return userObj;
    }
  };
}
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj,
    w: _Set
  };
}
{
  const f18 = _Array$from;
  const {
    w: _unused,
    ...r
  } = {
    w: Array
  };
}
{
  const i5 = _includesMaybeString('str');
}
{
  const keys = _Object$keys;
  keys;
}
{
  const {
    w: {
      keys: f
    }
  } = {
    w: c ? {
      keys: _Object$keys
    } : userObj
  };
}
{
  var _ref;
  const f2 = _Array$from;
  const {
    x: {
      [(effectful(), 'from')]: _unused2
    }
  } = {
    x: Array
  };
  const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
}
{
  const at = _at(r.y);
  at;
}
{
  const {
    y: _ref2,
    ...rest
  } = r;
  const at = _at(_ref2);
  [at, rest];
}
{
  const [{
    at: m
  }] = [eff(), eff2()];
}
{
  const values = _values(r.w);
  const at = _at(r.y);
}
{
  const {
    [(k(), 'at')]: s = d,
    z
  } = eff();
}
{
  const {
      [(k(), 'at')]: s
    } = eff(),
    q = 2;
}
{
  const {
    [(k(), 'at')]: s,
    [(k2(), 'flat')]: f,
    z
  } = eff();
}
{
  const _ref3 = [1, 2],
    {
      [(k(), 'at')]: _unused3,
      z
    } = _ref3,
    s = _atMaybeArray(_ref3);
}
{
  const s = _atMaybeArray(arr);
  const {
    [(k(), 'at')]: _unused4,
    z
  } = arr;
}
{
  const _ref4 = c ? a1 : a2,
    {
      [(k(), 'at')]: _unused5,
      z
    } = _ref4,
    s = _at(_ref4);
}
{
  const {
      [(k(), 'at')]: s,
      z
    } = eff(),
    q = 2;
}
{
  const {
    [(k(), 'at')]: s,
    z
  } = eff();
}
{
  const _ref5 = holder.p,
    {
      [(k(), 'at')]: _unused6,
      z
    } = _ref5,
    s = _at(_ref5);
}
{
  const {
    [(k(), 'at')]: v,
    flat: w
  } = eff();
}
{
  const v = _at(_globalThis.window?.arr);
}
{
  const v = _Array$of;
}
{
  const {
    a: {
      of: v
    }
  } = {
    a: c ? {
      of: _Array$of
    } : _Set
  };
}
{
  const v = _Array$of;
}
{
  const {
    a: {
      of: v
    }
  } = {
    a: _globalThis.window?.Array
  };
}
{
  const {
    a: {
      of: v
    }
  } = {
    a: null == _globalThis.window ? void 0 : _self.Array
  };
}
{
  const v = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
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
}
{
  const values = _values(r.w);
  const at = _at(r.y);
}
{
  if (c) var {
    at: m,
    z
  } = eff();
  use(m, z);
}
{
  if (c) var {
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
  if (c) {
    eff();
    const values = _values(r.w);
    const at = _at(r.y);
    [values, at];
  }
}
{
  label: {
    eff();
    const values = _values(r.w);
    const at = _at(r.y);
    [values, at];
  }
}
{
  let a;
  [, {
    from: a
  }] = [...rest, Array];
}
{
  let a;
  var _unused7;
  [{
    [(eff('k'), 'w')]: _unused7
  }] = [{
    w: src
  }];
  a = _at(src);
}
{
  let a;
  [(_pushMaybeArray(log).call(log, 'c'), arr)];
  a = _atMaybeArray(arr);
  use(a);
}
{
  let e, k;
  [{
    at: e
  }, k] = [(g(), f()), 1];
  use(e, k);
}