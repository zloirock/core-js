import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$keys from "@core-js/pure/actual/object/keys";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 3:
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
  const [_ref] = [eff(), r][1];
  const _ref2 = _ref.w;
  const values = _values(_ref2);
  const at = _at(_ref.y);
  [values, at];
}
{
  eff();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  const [_ref3] = [r, ...rest];
  const values = _values(_ref3.w);
  const at = _at(_ref3.y);
  [values, at];
}
{
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  const keys = _keys(r.w);
  [values, at, keys];
}
{
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  eff('m');
  const keys = _keys(r.w);
  const flat = _flatMaybeArray(r.y);
  [values, at, keys, flat];
}
{
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
  const q = 1;
  [values, at, q];
}
{
  eff('n');
  const values = _values(r.w);
  const at = _at(r.y);
}
{
  eff();
  eff2();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  eff();
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  const values = _values(r.w);
  const at = _at(r.y);
  [values, at];
}
{
  const [_ref4] = [r, eff('n')];
  const {
    w: _ref5
  } = _ref4;
  const values = _values(_ref5);
  const {
    is
  } = _ref5;
  const at = _at(_ref4.y);
  [values, is, at];
}
{
  const [_ref6] = [r, eff('n')];
  const at = _at(_ref6.y);
  at;
}
{
  const at = _at(r.y);
  at;
}
{
  const [_ref7] = [{
    y: getArr()
  }];
  const ci = _at(_ref7.y);
  use(ci);
}
{
  const _r = {
    w: Object
  };
  let {
    w: {
      keys
    }
  } = {
    w: {
      keys: _Object$keys
    }
  };
  keys;
}
{
  const box = [1];
  const [a] = [...rest, box];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  const box = [1];
  const [a] = [box];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  var _ref8;
  const box = [[1]];
  _atMaybeArray(_ref8 = box[0]).call(_ref8, 0);
}
{
  var _ref9;
  const box = [[1]];
  const [a] = [...rest, box];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref9 = box[0]).call(_ref9, 0);
}
{
  var _ref10;
  const box = [[1]];
  const [a] = [box];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref10 = box[0]).call(_ref10, 0);
}
{
  const f = id(Array).from;
  const g = (0, id)(Array).from;
}
{
  const f = id(Array).from;
}
{
  const f = id(Array, _pushMaybeArray(log).call(log, 2)).from;
}
{
  const f = id?.(Array).from;
}
{
  const host = [{
    from: f
  }] = [pick ? Array : userObj];
}
{
  const host = {
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj
  };
}
{
  const k = 'Map';
  const m = _Map;
  use(m);
}
{
  const k = 'Map';
  const {
    w: {
      [k]: m
    }
  } = {
    w: {
      Map: _Map
    }
  };
  use(m);
}
{
  const k = 'at';
  const m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const k = 'of';
  const f = _Array$of;
  use(f);
}
{
  const k = 'w';
  const [_ref11] = [{
    w: [1, 2]
  }];
  const m = _atMaybeArray(_ref11.w);
  use(m);
}
{
  const k = 'w';
  const {
    [k]: _ref12
  } = {
    w: [[1, 2]]
  };
  const [_ref13] = _ref12;
  const m = _atMaybeArray(_ref13);
  use(m);
}
{
  const k = 'w';
  const {
    [k]: {
      Array: {
        of: m
      }
    }
  } = {
    w: {
      Array: {
        of: _Array$of
      }
    }
  };
  use(m);
}
{
  const k = 'w';
  const {
    [k]: {
      Map: m
    }
  } = {
    w: {
      Map: _Map
    }
  };
  use(m);
}
{
  const k = 'w';
  const {
    [k]: {
      Map: m
    }
  } = {
    w: {
      Map: _Map
    },
    z: other
  };
  use(m);
}
{
  const k = 'w';
  const _ref14 = [1, 2];
  const m = _atMaybeArray(_ref14);
  const {
    [k]: {
      at: _unused
    }
  } = {
    ...spread,
    w: _ref14
  };
  use(m);
}
{
  const k = 'w';
  const m = _atMaybeArray([1, 2]);
  use(m);
}