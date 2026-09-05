import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
// probe corpus of the defense cycles over the destructure wrappers, family "spread", part 1:
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
  const M = _Map;
  const [, {
    Map: _unused
  }] = [0, _globalThis];
  new M();
}
{
  eff();
  const at = _atMaybeArray([1]);
}
{
  const f = _Array$from;
  const [, {
    from: _unused2
  }] = [0, Array];
}
{
  const [, {
    from: f
  }] = [0, pick ? {
    from: _Array$from
  } : userObj];
}
{
  const [[x]] = [...[[[1]]]];
  _atMaybeArray(x).call(x, 0);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const f = _Array$from;
}
{
  const [[{
    from: f
  }]] = [...[[...[Object]]]];
}
{
  const [a = [1]] = [...[[2]]];
  _atMaybeArray(a).call(a, 0);
}
{
  const [a = [1]] = [...[undefined]];
  _atMaybeArray(a).call(a, 0);
}
{
  const [x] = [...[[1, 2]], eff()];
  _atMaybeArray(x).call(x, 0);
}
{
  const [x] = [...[[1]], ...rest];
  _atMaybeArray(x).call(x, 0);
}
{
  const M = _Map;
  new M();
}
{
  const [{
    assign
  }] = [...[, Object]];
}
{
  const [_ref] = [...[, [1, 2]]];
  const at = _at(_ref);
}
{
  const [_ref2] = [...[, [1]]];
  const at = _at(_ref2);
}
{
  eff();
  const at = _atMaybeArray([1, 2]);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  eff();
  const at = _atMaybeArray([1]);
}
{
  const a = _atMaybeArray([1]);
}
{
  const f = _Array$from;
}
{
  const [{
    from: f
  }] = [...[, Array]];
}
{
  const [{
    from: f
  }] = [...[...[Array]]];
}
{
  const [{
    from: f
  }] = [...[0, pick ? Array : userObj]];
}
{
  const [{
    from: f
  }] = [...[0], Array];
}
{
  const [{
    from: f
  }] = [...[Array, ...rest]];
}
{
  const f = _Array$from;
  const [{
    z
  }] = [...[nb]];
}
{
  const f = _Array$from;
}
{
  const [{
    from: f
  }] = [...[]];
}
{
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj];
}
{
  var _ref3;
  const box = [1];
  const [, ...r] = [...[0, box]];
  _pushMaybeArray(_ref3 = r[0]).call(_ref3, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  const box = [1];
  const [a] = [...[box]];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  var _ref4, _ref5;
  const box = [[1]];
  const [, ...r] = [...[0, box]];
  _pushMaybeArray(_ref4 = r[0]).call(_ref4, 's');
  _at(_ref5 = box[0]).call(_ref5, 0);
}
{
  var _ref6;
  const box = [[1]];
  const [a] = [...[box]];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref6 = box[0]).call(_ref6, 0);
}
{
  var _ref7;
  const o = {
    a: [...[[1]]]
  };
  _atMaybeArray(_ref7 = o.a[0]).call(_ref7, 0);
}
{
  const v = _Object$freeze(...[Array]);
  v.from([]);
}
{
  const v = _Object$freeze(...[[1, 2]]);
  _atMaybeArray(v).call(v, 0);
}