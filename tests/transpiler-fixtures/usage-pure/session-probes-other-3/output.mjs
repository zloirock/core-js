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
  const {
    values: _unused
  } = _ref2;
  const {
    y: {
      at
    }
  } = _ref;
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
  const _ref4 = _ref3.w;
  const values = _values(_ref4);
  const {
    values: _unused2
  } = _ref4;
  const {
    y: {
      at
    }
  } = _ref3;
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
  const [{
    w: {
      values,
      is
    }
  }] = [r, eff('n')];
  const at = _at(r.y);
  [values, is, at];
}
{
  eff('n');
  const at = _at(r.y);
  at;
}
{
  const at = _at(r.y);
  at;
}
{
  const ci = _at(getArr());
  use(ci);
}
{
  const _r = {
    w: Object
  };
  let keys = _Object$keys;
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
  var _ref5;
  const box = [[1]];
  _atMaybeArray(_ref5 = box[0]).call(_ref5, 0);
}
{
  var _ref6;
  const box = [[1]];
  const [a] = [...rest, box];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref6 = box[0]).call(_ref6, 0);
}
{
  var _ref7;
  const box = [[1]];
  const [a] = [box];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref7 = box[0]).call(_ref7, 0);
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
  const m = _Map;
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
  const m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const k = 'w';
  const m = _atMaybeArray([1, 2]);
  use(m);
}
{
  const k = 'w';
  const m = _Array$of;
  use(m);
}
{
  const k = 'w';
  const m = _Map;
  use(m);
}
{
  const k = 'w';
  const m = _Map;
  use(m);
}
{
  const k = 'w';
  const _ref8 = [1, 2];
  const m = _atMaybeArray(_ref8);
  const {
    [k]: {
      at: _unused3
    }
  } = {
    ...spread,
    w: _ref8
  };
  use(m);
}
{
  const k = 'w';
  const m = _atMaybeArray([1, 2]);
  use(m);
}