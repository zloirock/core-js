import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
  for (const _ref3 of [[Object, [1]]]) {
    let [_ref, _ref2] = _ref3;
    let values = _values(_ref);
    let at = _atMaybeArray(_ref2);
    [values, at];
  }
}
{
  for (const _ref4 of [{
    w() {
      return Object;
    }
  }, {
    w() {
      return Object;
    }
  }]) {
    let {
      w: {
        keys
      }
    } = _ref4;
    keys;
  }
}
{
  for (let [_ref5] = [r, eff()], _ref6 = _ref5, values = _values(_ref6.w), at = _at(_ref6.y);;) {
    [values, at];
    break;
  }
}
{
  const _ref7 = [1, 2];
  const at = _atMaybeArray(_ref7);
}
{
  const _ref8 = [1];
  const a = _atMaybeArray(_ref8);
  const [{
    [(eff('k'), 'w')]: _unused
  }] = [{
    w: _ref8
  }];
}
{
  const _ref9 = [1, 2];
  const [{}] = [_ref9, ...rest];
  const at = _atMaybeArray(_ref9);
}
{
  let zLead = 1,
    values = _values(r.w),
    at = _at(r.y);
  [zLead, values, at];
}
{
  const [{}] = [r, eff('n')],
    values = _values(r.w),
    at = _at(r.y),
    zTail = 1;
  [values, at, zTail];
}
{
  const [{}] = [r, eff('n')],
    values = _values(r.w),
    at = _at(r.y),
    zTail = eff('t');
  [values, at, zTail];
}
{
  const zLead = eff('lead'),
    [{}] = [r, eff('n')],
    values = _values(r.w),
    at = _at(r.y);
  [zLead, values, at];
}
{
  const {
      prototype: _ref10
    } = _globalThis.Array,
    _ref11 = _ref10,
    a = null == _ref11 ? _ref11[""] : (eff('k2'), _atMaybeArray(_ref11));
}
{
  const {
      prototype: _ref12
    } = _globalThis.Array,
    _ref13 = _ref12,
    a = null == _ref13 ? _ref13[""] : (eff('k2'), _atMaybeArray(_ref13));
  _pushMaybeArray(log).call(log, a.call([3], 0));
}
{
  const {
    Array: {
      prototype: {
        [(eff('k2'), 'at')]: a
      }
    },
    ...r
  } = _globalThis;
}
{
  const _ref15 = {
      w: 'x'
    },
    {
      [(eff(), 'w')]: _ref14
    } = null == _ref15 ? _ref15[""] : _ref15,
    _ref16 = _ref14,
    a = null == _ref16 ? _ref16[""] : _atMaybeString(_ref16);
}
{
  const _ref18 = {
      w: 'str'
    },
    {
      [(eff(), 'w')]: _ref17
    } = null == _ref18 ? _ref18[""] : _ref18,
    _ref19 = _ref17,
    i3 = null == _ref19 ? _ref19[""] : _includesMaybeString(_ref19);
}
{
  const keys = _Object$keys;
  const {
    w: [, {
      keys: _unused2
    }]
  } = {
    w: [0, Object]
  };
}
{
  const F = _Array$from;
  const {
    z
  } = {
    w: _globalThis,
    z: 1
  };
  F(z);
}
{
  const {
    w: {
      Map: m,
      keep
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, keep, rest);
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
  const k = _Object$keys;
  const {
    q
  } = {
    w: eff(),
    q: 1
  };
  use(m, z, k, q);
}
{
  const k = _Object$keys;
  const {
    w: {
      at: m
    },
    z
  } = {
    w: eff(),
    z: 1
  };
  use(m, k, z);
}
{
  const {
    w: {
      includes: i4
    },
    ...r
  } = {
    w: 'str'
  };
}
{
  const values = _Object$values;
  const _ref20 = [1];
  const at = _atMaybeArray(_ref20);
  const {
    y: {
      at: _unused3
    }
  } = {
    w: Object,
    y: _ref20
  };
  [values, at];
}
{
  (x => (_pushMaybeArray(log).call(log, 'x'), x))(Array);
  const f = _Array$from;
}
{
  const _ref21 = [1, 2];
  const at = _atMaybeArray(_ref21);
}
{
  const _ref22 = [1, 2];
  const at = _atMaybeArray(_ref22);
}
{
  const {
    w: {
      keys: andHop
    },
    q: andQ
  } = {
    w: eff() && {
      keys: _Object$keys
    },
    q: 1
  };
  [andHop, andQ];
}
{
  const splitFrom = _Array$from;
  const _ref23 = _Array$of;
  const splitBesideStatic = _nameMaybeFunction(_ref23);
  const {
    foo: splitFoo
  } = _ref23;
  [splitBesideStatic, splitFoo, splitFrom];
}
{
  const _ref24 = _Array$of;
  const defaultName = _nameMaybeFunction(_ref24);
  const {
    foo: defaultFoo
  } = _ref24;
  const {
    junk: defaultJunk
  } = Array;
  [defaultJunk, defaultName, defaultFoo];
}
{
  const soleOrderFrom = _Array$from;
  const soleOrder = _nameMaybeFunction(_Array$of);
  [soleOrder, soleOrderFrom];
}
{
  const soleResidual = _nameMaybeFunction(_Array$of);
  const {
    junk: soleResidualJunk
  } = _globalThis.Array;
  [soleResidual, soleResidualJunk];
}
{
  const soleInstanceResidual = _atMaybeArray(_globalThis.Array.prototype);
  const {
    junk: soleInstanceJunk
  } = _globalThis.Array;
  [soleInstanceResidual, soleInstanceJunk];
}