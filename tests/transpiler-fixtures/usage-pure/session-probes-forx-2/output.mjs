import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 2:
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
  for (const {
    a,
    w: {
      at: m
    }
  } = {
    a: g(),
    w: eff()
  };;) use(a, m);
}
{
  for (const {
    at: m,
    z
  } = eff();;) use(m, z);
}
{
  for (const {
    entries
  } of [{
    entries: _Object$entries
  }, {
    entries: _Object$entries
  }]) entries;
}
{
  for (const {
    entries
  } of [{
    entries: _Object$entries
  }]) entries;
}
{
  for (const {
    from
  } of [{
    from: _Array$from
  }, {
    from: _Array$from
  }]) from;
}
{
  for (const {
    from
  } of [id(Array)]) _pushMaybeArray(log).call(log, from);
}
{
  for (const _ref2 of [{
    w: [[1]]
  }]) {
    const {
      w: [_ref]
    } = _ref2;
    const at = _atMaybeArray(_ref);
    at;
  }
}
{
  for (const {
    w: [{
      is
    } = {}]
  } of [{
    w: [{
      is: _Object$is
    }]
  }]) is;
}
{
  for (const {
    w: [{
      is
    }]
  } of [{
    w: [{
      is: _Object$is
    }]
  }, {
    w: [{
      is: _Object$is
    }]
  }]) is;
}
{
  for (const {
    w: [{
      is
    }]
  } of [{
    w: [Object]
  }, {
    w: [userObj]
  }]) is;
}
{
  for (const {
    w: [{
      is
    }]
  } of [{
    w: [{
      is: _Object$is
    }]
  }]) is;
}
{
  for (const {
    w: [{
      is
    }]
  } of [{
    w: [c ? {
      is: _Object$is
    } : userObj]
  }]) is;
}
{
  for (const {
    w: [{
      values
    }]
  } of [{
    w: [{
      values: _Object$values
    }]
  }]) values;
}
{
  for (const {
    w: {
      [(eff(), 'keys')]: k
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }]) k;
}
{
  for (const {
    w: {
      [_Symbol$iterator]: it
    }
  } of [{
    w: [1]
  }]) it;
}
{
  for (const _ref4 of [{
    w: [1]
  }, {
    w: 's'
  }]) {
    const at = _at(_ref4.w);
    at;
  }
}
{
  for (const _ref5 of [{
    w: [1]
  }, {
    w: [1]
  }]) {
    const at = _atMaybeArray(_ref5.w);
    at;
  }
}
{
  for (const _ref6 of [{
    w: [1]
  }, {
    w: [2]
  }]) {
    const at = _atMaybeArray(_ref6.w);
    at;
  }
}
{
  for (const _ref7 of [{
    w: [1]
  }]) {
    const at = _atMaybeArray(_ref7.w);
    at;
  }
}
{
  for (const _ref8 in obj) {
    const m = _at(_ref8.w);
    use(m);
  }
}
{
  for (const _ref9 = {
      w: [1, 2],
      z: 1
    }, m = _atMaybeArray(_ref9.w), {
      z
    } = _ref9;;) use(m, z);
}
{
  for (const {
    w: {
      at: m
    },
    z
  } = {
    w: eff(),
    z: 1
  }; c;) use(m, z);
}
{
  for (const {
    w: {
      at: m
    },
    z
  } = {
    w: eff(),
    z: 1
  };;) use(m, z);
}
{
  for (const {
    w: {
      entries = null
    }
  } of [{
    w: {
      entries: _Object$entries
    }
  }]) entries;
}
{
  for (const _ref10 in obj) {
    const entries = _entries(_ref10.w);
    entries;
  }
}
{
  for (const {
    w: {
      entries
    }
  } of [{
    w: _Map
  }]) entries;
}
{
  for (const _ref13 of [{
    w: Object
  }, _globalThis]) {
    const {
        w: _ref12
      } = _ref13,
      entries = _ref12 === Object ? _Object$entries : _entries(_ref12);
    entries;
  }
}
{
  for (const {
    w: {
      entries
    }
  } of [{
    w: {
      entries: _Object$entries
    }
  }, {
    w: {
      entries: _Object$entries
    }
  }]) entries;
}
{
  for (const _ref15 of [{
    w: Object
  }, {
    w: userObj
  }]) {
    const {
        w: _ref14
      } = _ref15,
      entries = _ref14 === Object ? _Object$entries : _entries(_ref14);
    entries;
  }
}
{
  for (const {
    w: {
      entries
    }
  } of [{
    w: {
      entries: _Object$entries
    }
  }]) entries;
}
{
  for (const {
    w: {
      entries
    }
  } of [{
    w: {
      entries: _Object$entries
    }
  }]) {
    entries = 1;
  }
}
{
  for (const _ref16 of [{
    w: Object,
    at: 1
  }, {
    w: Object,
    at: 2
  }]) {
    const entries = _Object$entries;
    const {
      at
    } = _ref16;
    [entries, at];
  }
}
{
  for (const _ref17 of [{
    w: Object,
    at: 1
  }]) {
    const entries = _Object$entries;
    const {
      at
    } = _ref17;
    [entries, at];
  }
}
{
  for (const _ref18 of [{
    w: Object,
    y: [1]
  }]) {
    const entries = _Object$entries;
    const at = _atMaybeArray(_ref18.y);
    [entries, at];
  }
}
{
  for (const {
    w: {
      entries
    },
    z
  } of [{
    w: {
      entries: _Object$entries
    },
    z: 1
  }]) [entries, z];
}
{
  for (const {
    w: {
      entries,
      is
    }
  } of [{
    w: {
      entries: _Object$entries,
      is: _Object$is
    }
  }]) [entries, is];
}
{
  for (const _ref19 of [{
    w: arr
  }]) {
    const flat = _flatMaybeArray(_ref19.w);
    flat;
  }
}
{
  for (const {
    w: {
      getOwnPropertyNames: g
    }
  } of [{
    w: {
      getOwnPropertyNames: _Object$getOwnPropertyNames
    }
  }]) g;
}
{
  for (const {
    w: {
      is
    }
  } of [{
    w: {
      is: _Object$is
    }
  }, {
    w: {
      is: _Object$is
    }
  }]) is;
}
{
  for (const _ref21 of [{
    w: Object
  }, {
    w: 1
  }]) {
    const {
        w: _ref20
      } = _ref21,
      is = _ref20 === Object ? _Object$is : _ref20.is;
    is;
  }
}