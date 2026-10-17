import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
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
  const [, {
    Map: M
  }] = [...[0, {
    Map: _Map
  }]];
  new M();
}
{
  eff();
  const at = _atMaybeArray([1]);
}
{
  const [, {
    from: f
  }] = [...[0, {
    from: _Array$from
  }]];
}
{
  const [, {
    from: f
  }] = [...[0], pick ? {
    from: _Array$from
  } : userObj];
}
{
  const [[x]] = [...[[[1]]]];
  _atMaybeArray(x).call(x, 0);
}
{
  const [[_ref]] = [...[[...[[1, 2]]]]];
  const at = _atMaybeArray(_ref);
}
{
  const [[_ref2]] = [[...[[1, 2]]]];
  const at = _atMaybeArray(_ref2);
}
{
  const [[{
    from: f
  }]] = [...[[...[{
    from: _Array$from
  }]]]];
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
  const [{
    Map: M
  }] = [...[{
    Map: _Map
  }]];
  new M();
}
{
  const [{
    assign
  }] = [...[, Object]];
}
{
  const [_ref3] = [...[, [1, 2]]];
  const at = _at(_ref3);
}
{
  const [_ref4] = [...[, [1]]];
  const at = _at(_ref4);
}
{
  const [_ref5] = [...[[1, 2]], eff()];
  const at = _atMaybeArray(_ref5);
}
{
  const at = _atMaybeArray([1, 2]);
}
{
  const [_ref6] = [...[[1]], eff()];
  const at = _atMaybeArray(_ref6);
}
{
  const a = _atMaybeArray([1]);
}
{
  const [{
    from: f
  }] = [...[{
    from: _Array$from
  }]];
}
{
  const [{
    from: f
  }] = [...[, Array]];
}
{
  const [{
    from: f
  }] = [...[...[{
    from: _Array$from
  }]]];
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
  }] = [...[{
    from: _Array$from
  }, ...rest]];
}
{
  const [{
      from: f
    }] = [...[{
      from: _Array$from
    }]],
    [{
      z
    }] = [...[nb]];
}
{
  const [{
    from: f
  }] = [...[{
    from: _Array$from
  }]];
}
{
  const [{
    from: f
  }] = [...[]];
}
{
  const [{
    from: f
  }] = [...[pick ? {
    from: _Array$from
  } : userObj]];
}
{
  var _ref7;
  const box = [1];
  const [, ...r] = [...[0, box]];
  _pushMaybeArray(_ref7 = r[0]).call(_ref7, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  const box = [1];
  const [a] = [...[box]];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  var _ref8, _ref9;
  const box = [[1]];
  const [, ...r] = [...[0, box]];
  _pushMaybeArray(_ref8 = r[0]).call(_ref8, 's');
  _at(_ref9 = box[0]).call(_ref9, 0);
}
{
  var _ref10;
  const box = [[1]];
  const [a] = [...[box]];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref10 = box[0]).call(_ref10, 0);
}
{
  var _ref11;
  const o = {
    a: [...[[1]]]
  };
  _atMaybeArray(_ref11 = o.a[0]).call(_ref11, 0);
}
{
  const v = _Object$freeze(...[Array]);
  v.from([]);
}
{
  const v = _Object$freeze(...[[1, 2]]);
  _atMaybeArray(v).call(v, 0);
}