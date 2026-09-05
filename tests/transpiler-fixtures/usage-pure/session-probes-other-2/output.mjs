import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Set from "@core-js/pure/actual/set/constructor";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
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
  const a = _at(pick ? [1] : 'x');
}
{
  const _ref = getArr();
  eff2();
  const ci = _at(_ref);
  use(ci);
}
{
  const [{
    at: m
  }, other] = [eff(), eff2()];
  use(m, other);
}
{
  const [{
    at: m
  }, z] = [eff(), 1];
  use(m, z);
}
{
  eff2();
  const m = _atMaybeArray(arr);
  use(m);
}
{
  const [{
      at: m
    }] = [eff(), eff2()],
    z = 1;
  use(m, z);
}
{
  const [{
    at: m
  }] = [eff(), eff2()];
  use(m);
}
{
  const f = _Array$from;
}
{
  const [{
    from: f
  } = {}] = [pick ? {
    from: _Array$from
  } : _Set];
}
{
  const [{
    from: f
  } = {}] = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  const [{
    from: f
  }, x] = [pick ? {
    from: _Array$from
  } : _Set, 1];
}
{
  const [{
    from: f
  }, z] = [pick ? {
    from: _Array$from
  } : userObj, eff()];
}
{
  const M = _Map;
  const [{
    from: f
  }, {
    Map: _unused
  }] = [pick ? {
    from: _Array$from
  } : userObj, _globalThis];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof M);
}
{
  const a = _atMaybeArray(arr);
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj, arr];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
{
  const [{
    from: f
  }] = [(mark++, pick ? {
    from: _Array$from
  } : userObj)];
}
{
  const [{
    from: f
  }] = [...wrapped];
}
{
  eff();
  const f = _Array$from;
}
{
  const f = _Array$from;
}
{
  const [{
    from: f
  }] = [c ? {
    from: _Array$from
  } : userObj];
}
{
  const [{
    from: f
  }] = [g];
}
{
  const [{
    from: f
  }] = [pick && {
    from: _Array$from
  }];
}
{
  const [{
    from: f
  }] = [pick ? (mark++, {
    from: _Array$from
  }) : userObj];
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : Object];
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : _Set];
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj, eff()];
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  const [{
    from: f
  }] = [pick ? _Set : {
    from: _Array$from
  }];
}
{
  const [{
    from: f
  }] = [pick ? _globalThis : _Set];
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : _Set];
}
{
  const [{
    from: f,
    at: a
  }] = [pick ? {
    from: _Array$from,
    at: Array.at
  } : userObj];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
{
  const [{
    isArray: f
  }] = [pick ? Array : _Set];
}
{
  const hasOwn = _Object$hasOwn;
}
{
  const m = _atMaybeArray((mark(), arr));
  use(m);
}
{
  eff2();
  const m = _atMaybeArray(arr);
  use(m);
}
{
  const [{
    w: {
      at: m
    }
  }] = [{
    w: eff()
  }, eff2()];
  use(m);
}
{
  const [{
    w: {
      from: f
    }
  }] = [{
    w: pick ? {
      from: _Array$from
    } : userObj
  }];
}
{
  const keys = _keys(r.w);
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  [keys, values, at];
}
{
  eff('n');
  const values = _values(r.w);
  values;
}
{
  const values = _values(r.w);
  const at = _at(r.y);
  const [{}, x] = [r, 1];
  [values, at, x];
}
{
  const [{
    w: {
      values
    },
    y: {
      at
    }
  }] = [(eff(), r)];
  [values, at];
}