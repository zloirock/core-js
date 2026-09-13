import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// probe corpus of the defense cycles over the destructure wrappers, family "param", part 3:
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
  function f({
    at
  } = {
    at: _atMaybeArray(arr)
  }) {
    return at;
  }
}
{
  function f({} = (x => (_pushMaybeArray(log).call(log, 'x'), x))(Array)) {
    let from = _Array$from;
    return from;
  }
}
{
  function f({
    from
  } = {
    from: _Array$from
  }) {
    return from;
  }
}
{
  function f({
    from
  } = id(Array)) {
    return from;
  }
}
{
  function f({
    from
  } = id(Array), y = 1) {
    return from;
  }
}
{
  function f({
    x
  }) {
    return x;
  }
  const v = f(...[{
    x: [1]
  }]);
  _atMaybeArray(v).call(v, 0);
}
{
  function f({
    x
  }) {
    return x;
  }
  const v = f(...rest);
  _at(v).call(v, 0);
}
{
  function fromArr([{
    from
  } = {}] = [{
    from: _Array$from
  }]) {
    return from;
  }
}
{
  function g([{
    [_Symbol$iterator]: it
  }] = [{
    [_Symbol$iterator]: _getIteratorMethod([1])
  }]) {
    return it;
  }
}
{
  function g([{
    at
  }] = [{
    at: _atMaybeArray([1, 2])
  }]) {
    return at;
  }
}
{
  function g([{
    at
  }] = [{
    at: _atMaybeArray(arr)
  }]) {
    return at;
  }
}
{
  function g([{
    from: f
  } = {}] = [pick ? {
    from: _Array$from
  } : userObj]) {
    return f;
  }
}
{
  function g([{
    from: f
  }] = [{
    from: _Array$from
  }]) {
    return f;
  }
}
{
  function g([{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj]) {
    return f;
  }
}
{
  function g([{
    hasOwn
  }, {
    is
  }] = [{
    hasOwn: _Object$hasOwn
  }, {
    is: _Object$is
  }]) {
    return [hasOwn, is];
  }
}
{
  function g([{
    hasOwn
  }] = [{
    hasOwn: _Object$hasOwn
  }]) {
    return hasOwn;
  }
}
{
  function g([{
    y: {
      at: a
    }
  }] = [nb]) {
    return a;
  }
}
{
  function g(a = 's') {
    _at(a).call(a, 0);
  }
  g(...[[1]]);
}
{
  function g(a = 's') {
    _at(a).call(a, 0);
  }
  g(...rest);
}
{
  function g(a = [1]) {
    _atMaybeArray(a).call(a, 0);
  }
  g();
}
{
  function g(a = [1]) {
    _at(a).call(a, 0);
  }
  g(...[[1]]);
}
{
  function g(a = [1]) {
    _at(a).call(a, 0);
  }
  g([1]);
}
{
  function g(a) {
    _at(a).call(a, 0);
  }
  g(...[[1]]);
}
{
  function g(a) {
    _at(a).call(a, 0);
  }
  g([1]);
}
{
  function g({
    [(eff('k'), 'Array')]: {
      from: f10
    }
  } = {
    Array: {
      from: _Array$from
    }
  }) {
    return f10;
  }
}
{
  function g({
    a: [{
      hasOwn
    }]
  } = {
    a: [{
      hasOwn: _Object$hasOwn
    }]
  }) {
    return hasOwn;
  }
}
{
  function g({
    a: {
      hasOwn
    },
    b: {
      keys
    }
  } = {
    a: {
      hasOwn: _Object$hasOwn
    },
    b: {
      keys: _Object$keys
    }
  }) {
    return [hasOwn, keys];
  }
}
{
  function g({
    from: f
  } = pick ? {
    from: _Array$from
  } : userObj) {
    return f;
  }
}
{
  function g({
    w: [{
      hasOwn
    } = {}] = []
  } = {
    w: [{
      hasOwn: _Object$hasOwn
    }]
  }) {
    return hasOwn;
  }
}
{
  function g({
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  }) {
    return f;
  }
  _pushMaybeArray(log).call(log, g() === _Array$from, g({
    w: userObj
  })());
}
{
  // A later computed key can replace w. Substitute Map only when the final w still holds the realm object.
  function k(key) {
    const {
        w: _ref
      } = {
        w: _globalThis,
        [key]: other
      },
      kd = _ref === _globalThis ? _Map : _ref.Map;
    return kd;
  }
}
{
  // Read the nested method once before evaluating the following computed key and reading its property.
  function key() {
    return 'k';
  }
  const _ref2 = {
    m: [1],
    k: 2
  };
  const at = _atMaybeArray(_ref2.m);
  const {
    [key()]: picked
  } = _ref2;
}
{
  function mark() {}
  const viaSeqArg = (({
    at: m
  }) => m)((mark(), {
    at: _atMaybeArray([1, 2])
  }));
  use(viaSeqArg);
}
{
  function p({
    w: {
      at: m
    }
  } = {
    w: {
      at: _atMaybeString('ab')
    }
  }) {
    use(m);
  }
  p();
}
{
  let pick = 1;
  const userObj = {};
  function g([{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj]) {
    return f;
  }
}