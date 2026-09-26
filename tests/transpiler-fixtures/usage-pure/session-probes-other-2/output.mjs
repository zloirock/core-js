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
  const [_ref] = [getArr(), eff2()];
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
  const [_ref2] = [arr, eff2()];
  const m = _atMaybeArray(_ref2);
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
  const [{
    from: f
  } = {}] = [{
    from: _Array$from
  }];
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
  const [_ref3, _ref4] = [pick ? {
    from: _Array$from
  } : _Set, 1];
  const {
    from: f
  } = _ref3;
  const x = _ref4;
}
{
  const [_ref5, _ref6] = [pick ? {
    from: _Array$from
  } : userObj, eff()];
  const {
    from: f
  } = _ref5;
  const z = _ref6;
}
{
  const [{
    from: f
  }, {
    Map: M
  }] = [pick ? {
    from: _Array$from
  } : userObj, {
    Map: _Map
  }];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof M);
}
{
  // The native first slot reads before the second slot's instance extraction.
  const [_ref7, _ref8] = [pick ? {
    from: _Array$from
  } : userObj, arr];
  const {
    from: f
  } = _ref7;
  const a = _atMaybeArray(_ref8);
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
  const [{
    from: f
  }] = [{
    from: _Array$from
  }, eff()];
}
{
  const [{
    from: f
  }] = [{
    from: _Array$from
  }];
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
  const [{
    w: [{
      hasOwn
    }]
  }] = [{
    w: [{
      hasOwn: _Object$hasOwn
    }]
  }];
}
{
  const [_ref9] = [{
    w: (mark(), arr)
  }];
  const m = _atMaybeArray(_ref9.w);
  use(m);
}
{
  const [_ref10] = [{
    w: arr
  }, eff2()];
  const m = _atMaybeArray(_ref10.w);
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
  const [_ref11] = [r, eff('n')];
  const values = _values(_ref11.w);
  values;
}
{
  const [_ref12, _ref13] = [r, 1];
  const _ref14 = _ref12;
  const values = _values(_ref14.w);
  const at = _at(_ref14.y);
  const x = _ref13;
  [values, at, x];
}
{
  const [_ref15] = [(eff(), r)];
  const values = _values(_ref15.w);
  const at = _at(_ref15.y);
  [values, at];
}