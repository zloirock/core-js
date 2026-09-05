import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
// probe corpus of the defense cycles over the destructure wrappers, family "ts", part 2:
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
      at: m
    },
    z
  } = {
    w: eff() as any,
    z: 1
  };
  use(m, z);
}
{
  for (const [{
    from
  }] of [[{
    from: _Array$from
  }]]) from;
}
{
  for (const {
    w: {
      is
    }
  } of [{
    w: {
      is: _Object$is
    } as any
  }, {
    w: {
      is: _Object$is
    }
  }]) is;
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    } as any
  }, {
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  function g([{
    from
  }] = [{
    from: _Array$from
  }]) {
    return from;
  }
}
{
  let values = _values(r.w);
  let at = _at(r.y);
  [values, at];
}
{
  var _ref;
  o['data' as string] = 'str';
  const r1 = _at(_ref = o['data' as string]).call(_ref, 0);
}
{
  var _ref2;
  o[E.A as string] = 'str';
  const r3 = _at(_ref2 = o[E.A]).call(_ref2, 0);
}