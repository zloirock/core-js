import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Set from "@core-js/pure/actual/set/constructor";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
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
  const is = _Object$is;
  is;
}
{
  [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  class C1 {
    constructor([{
      from: f
    }] = [pick ? {
      from: _Array$from
    } : userObj]) {
      this.f = f;
    }
  }
  _pushMaybeArray(log).call(log, new C1().f === _Array$from, new C1([userObj]).f());
}
{
  class C5 {
    static {
      const [{
        from: f
      }] = [pick ? {
        from: _Array$from
      } : userObj];
      C5.f = f;
    }
  }
  _pushMaybeArray(log).call(log, C5.f === _Array$from);
}
{
  const [, [_ref]] = [...rest, [[1]]];
  const at = _at(_ref);
}
{
  const [, {
    Map: M
  }] = [...rest, _globalThis];
  new M();
}
{
  const [, _ref2] = [...rest, [1]];
  const at = _at(_ref2);
}
{
  eff();
  const _ref3 = getArr();
  const ci = _at(_ref3);
  use(ci);
}
{
  const [, {
    at: m
  }, z] = [eff0(), eff(), 1];
  use(m, z);
}
{
  const [, {
    at: m
  }] = [eff0(), eff()];
  use(m);
}
{
  const [, {
    from: f
  }] = [, pick ? {
    from: _Array$from
  } : userObj];
}
{
  const [, {
    from: f
  }] = [...rest, Array];
}
{
  eff();
  const f = _Array$from;
  const [, {
    from: _unused
  }] = [, Array];
}
{
  const [, {
    from: f
  }] = [eff(), pick && {
    from: _Array$from
  }];
}
{
  const [, {
    from: f
  }] = [eff(), pick ? {
    from: _Array$from
  } : userObj];
}
{
  eff();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  eff();
  const _ref4 = (mark(), getArr());
  const ci = _at(_ref4);
  use(ci);
}
{
  eff();
  const ci = _atMaybeArray(arr);
  use(ci);
}
{
  eff();
  const _ref5 = getArr();
  const ci = _at(_ref5);
  use(ci);
}
{
  const [[{
    from: f
  }]] = [...rest, [Array]];
}
{
  const [[{
    from: f
  }]] = [[pick ? {
    from: _Array$from
  } : userObj]];
}
{
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  const [{
    Array: {
      from: f
    }
  } = {}] = [pick ? {
    Array: {
      from: _Array$from
    }
  } : _Set];
}
{
  const [{
    Array: {
      from: f
    }
  }] = [pick ? {
    Array: {
      from: _Array$from
    }
  } : _Set];
}
{
  const it = _getIteratorMethod([1]);
}
{
  const [{
    a
  }, {
    at: m
  }] = [g(), eff()];
  use(a, m);
}
{
  const hasOwn = _Object$hasOwn;
}
{
  const [{
    assign
  }] = [, Object];
}
{
  const [{
    at
  }] = [, [1, 2]];
}
{
  const [_ref6] = [...rest, [1, 2]];
  const at = _at(_ref6);
}
{
  const [_ref7] = [...rest, [1]];
  const at = _at(_ref7);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  eff();
  const at = _atMaybeArray([1]);
}
{
  const [_ref8] = [[eff()], ...rest];
  const at = _atMaybeArray(_ref8);
}
{
  const a = _atMaybeArray(arr);
  const [{}, {
    from: f
  }] = [arr, pick ? {
    from: _Array$from
  } : userObj];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
{
  const [{
    at: a
  }] = [eff()];
}