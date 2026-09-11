import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// probe corpus rows whose two legs print DIFFERENT but equivalent trees - the classes the unplugin
// package's AGENTS.md accepts, held here as one sidecar so every other corpus fixture compares clean:
// - ref-hoist placement: a re-referenceable literal receiver memoized by one leg and read inline by
//   the other (`[0, [1, 2]]`, `[...[0, [1, 2]]]`, `_globalThis.Array.prototype` under an effectful
//   key, a primitive `'str'` slot)
// - a husk beside a SIBLING declarator: babel keeps `[{}] = [r, eff()]` in place, unplugin lifts the
//   effect as a statement (the sibling-host residual canon)
// - placement of PURE extractions and memos around each other (a static beside an instance memo,
//   the relocated head's per-prop order, an IIFE argument hoisted as a statement or spelled as a
//   sequence, a hop's rescued call as a sequence or a statement)
// - a sentinel residual one leg keeps and the other drops where nothing binds (`{ w: [, { keys:
//   _unused }] }` over a pure init, `Map: _unused` beside a binding sibling under an outer rest)
// - a leaf and a STATIC sibling of the same level of a proxy-global host (`{ Array: { of: { name,
//   foo }, from: F } } = globalThis`, `{ Array: { of: { name }, from: F } }`): the two legs order the
//   sibling's extraction and the leaf's pair differently - pure reads either way
// - the hop residual a proxy-global host keeps beside an extracted leaf (`{ Array: { of: { name },
//   junk } } = globalThis`): babel collapses it onto the hop (`{ junk } = _globalThis.Array`), unplugin
//   keeps the hop in the pattern (`{ Array: { junk } } = _globalThis`) - the residual class the
//   sibling-static form (`{ Array: { from, isArray } }`) already prints
// - a PATTERN default over a static beside a sibling (`{ junk, of: { name, foo } = {} } = Array`):
//   babel's per-prop extraction of the static stands ahead of the host, unplugin's twin behind it
// - an `&&` hop value whose left is a call typed to return a constructor (`{ w: eff() && Object }`
//   beside a sibling): unplugin extracts off the typed left, babel keeps the native read (the falsy
//   left's own short-circuit)
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
    let at = _at(_ref2);
    let values = _values(_ref);
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
    let keys = _keys(_ref4.w);
    keys;
  }
}
{
  for (let [{}] = [r, eff()], values = _values(r.w), at = _at(r.y);;) {
    [values, at];
    break;
  }
}
{
  const _ref5 = [1, 2];
  const at = _atMaybeArray(_ref5);
}
{
  const _ref6 = [1];
  const a = _atMaybeArray(_ref6);
  const [{
    [(eff('k'), 'w')]: _unused
  }] = [{
    w: _ref6
  }];
}
{
  const _ref7 = [1, 2];
  const [{}] = [_ref7, ...rest];
  const at = _atMaybeArray(_ref7);
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
  const _ref8 = _globalThis.Array.prototype;
  const a = _atMaybeArray(_ref8);
  const {
    prototype: {
      [(eff('k2'), 'at')]: _unused2
    }
  } = _globalThis.Array;
}
{
  const _ref9 = _globalThis.Array.prototype;
  const a = _atMaybeArray(_ref9);
  const {
    prototype: {
      [(eff('k2'), 'at')]: _unused3
    }
  } = _globalThis.Array;
  _pushMaybeArray(log).call(log, a.call([3], 0));
}
{
  const _ref10 = _globalThis.Array.prototype;
  const a = _atMaybeArray(_ref10);
  const {
    Array: {
      prototype: {
        [(eff('k2'), 'at')]: _unused4
      }
    },
    ...r
  } = _globalThis;
}
{
  const a = _atMaybeString('x');
  const {
    [(eff(), 'w')]: {
      at: _unused5
    }
  } = {
    w: 'x'
  };
}
{
  const i3 = _includesMaybeString('str');
  const {
    [(eff(), 'w')]: {
      includes: _unused6
    }
  } = {
    w: 'str'
  };
}
{
  const keys = _Object$keys;
  const {
    w: [, {
      keys: _unused7
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
  const m = _Map;
  const {
    w: {
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
  const i4 = _includesMaybeString('str');
  const {
    w: {
      includes: _unused8
    },
    ...r
  } = {
    w: 'str'
  };
}
{
  const values = _Object$values;
  const _ref11 = [1];
  const at = _atMaybeArray(_ref11);
  const {
    y: {
      at: _unused9
    }
  } = {
    w: Object,
    y: _ref11
  };
  [values, at];
}
{
  (x => (_pushMaybeArray(log).call(log, 'x'), x))(Array);
  const f = _Array$from;
}
{
  const _ref12 = [1, 2];
  const at = _atMaybeArray(_ref12);
}
{
  const _ref13 = [1, 2];
  const at = _atMaybeArray(_ref13);
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
  const _ref14 = _Array$of;
  const splitFrom = _Array$from;
  const splitBesideStatic = _nameMaybeFunction(_ref14);
  const {
    foo: splitFoo
  } = _ref14;
  [splitBesideStatic, splitFoo, splitFrom];
}
{
  const _ref15 = _Array$of;
  const defaultName = _nameMaybeFunction(_ref15);
  const {
    foo: defaultFoo
  } = _ref15;
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