import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// probe corpus of the defense cycles over the destructure wrappers, family "ts", part 1:
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
  class K {
    f = (([{
      from
    }]) => from)(...([[{
      from: _Array$from
    }]] as any));
  }
}
{
  const f = _Array$from;
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const at = _atMaybeArray([1, 2] as any);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const at = _atMaybeArray([1, 2]);
  at(0);
}
{
  const at = _atMaybeArray([1, 2] as any);
}
{
  const f = _Array$from;
}
{
  const [{
    from: f
  }] = [(pick ? {
    from: _Array$from
  } : userObj) as any];
}
{
  const f = _Array$from;
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  const k = (tag: string) => (_pushMaybeArray(log).call(log, tag), tag)!;
  const a = _atMaybeArray(arr);
  const {
    [k('at')!]: _unused
  } = arr;
}
{
  const k = (tag: string) => (_pushMaybeArray(log).call(log, tag), tag);
  const a = _atMaybeArray(arr);
  const {
    [(k as any)('at')]: _unused2
  } = arr;
}
{
  const k = (tag: string) => (_pushMaybeArray(log).call(log, tag), tag);
  const a = _atMaybeArray(arr);
  const {
    [k('at' as string)]: _unused3
  } = arr;
}
{
  const k = (tag: string): string => (_pushMaybeArray(log).call(log, tag), tag);
  const a = _atMaybeArray(arr);
  const {
    [k('at')]: _unused4
  } = arr;
}
{
  const k = <T,>(tag: T): T => (_pushMaybeArray(log).call(log, String(tag)), tag);
  const a = _atMaybeArray(arr);
  const {
    [k<string>('at')]: _unused5
  } = arr;
}
{
  const r = (([{
    at
  }]) => at)([{
    at: _atMaybeArray([1])
  }] as any);
}
{
  const r = (([{
    from: f
  }]) => f)(...([[pick ? {
    from: _Array$from
  } : userObj]] as any));
}
{
  const r = ((a: any) => a)(...([Array] as any));
  const o = _Array$of;
}
{
  const r = (({
    at
  }) => at)(...([{
    at: _atMaybeArray([1, 2])
  }] as any));
}
{
  const r = (({
    from
  }) => from)(...([{
    from: _Array$from
  }] as any));
}
{
  const r = (({
    from: f
  }) => f)(...([pick ? {
    from: _Array$from
  } : userObj] as any));
}
{
  const r = (({
    w: [{
      at
    }]
  }) => at)({
    w: [{
      at: _atMaybeArray([1])
    } as number[]]
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }]
  } as any);
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    }] as any
  });
}
{
  const r = (({
    w: [{
      hasOwn
    }]
  }) => hasOwn)({
    w: [{
      hasOwn: _Object$hasOwn
    } as any]
  });
}
{
  const r = (0, ({
    at
  }) => at)({
    at: _atMaybeArray([1, 2])
  } as any);
}
{
  var _ref;
  const r = _at(_ref = o['data' as string]).call(_ref, 0);
}
{
  var _ref2;
  const r4 = _at(_ref2 = o['s' as string]).call(_ref2, 0);
}
{
  const v = _Object$freeze(...([Array] as any));
  v.from([]);
}
{
  const v = _Object$freeze(...([[1, 2]] as any));
  _atMaybeArray(v).call(v, 0);
}
{
  const v = _Promise$resolve(...([Array] as any));
  v.then(A => A.from([]));
}
{
  const v = _Promise$resolve(...([[1, 2]] as any));
  v.then(a => _at(a).call(a, 0));
}
{
  const a = _at(src);
}
{
  const a = _at(src);
  const {
    [(eff('k'), 'w' as string)]: {
      at: _unused6
    }
  } = {
    w: src
  };
}
{
  const a = _at(src);
  const {
    [(eff('k'), 'w')]: {
      at: _unused7
    }
  } = {
    w: src
  } as any;
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const {
    at: m,
    z
  } = eff() as any;
  use(m, z);
}
{
  const _ref3 = [1, 2];
  const m = _atMaybeArray(_ref3);
  const {
    w: {
      at: _unused8
    },
    z
  } = {
    w: _ref3 as any,
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
    w: eff() as any,
    z: 1
  } as any;
  use(m, z);
}