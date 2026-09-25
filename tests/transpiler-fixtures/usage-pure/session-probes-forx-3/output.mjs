import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
// probe corpus of the defense cycles over the destructure wrappers, family "forx", part 3:
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
  }, {
    w: {
      is: _Object$is
    }
  }]) is;
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
  for (const {
    w: {
      is
    },
    z
  } of [{
    w: {
      is: _Object$is
    },
    z: 's'
  }, {
    w: {
      is: _Object$is
    },
    z: 2
  }]) [is, z];
}
{
  for (const {
    w: {
      is
    },
    z
  } of [{
    w: {
      is: _Object$is
    },
    z: 1
  }]) [is, z];
}
{
  for (const {
    w: {
      is
    },
    z
  } of [{
    w: {
      is: _Object$is
    },
    z: null
  }, {
    w: {
      is: _Object$is
    },
    z: true
  }]) [is, z];
}
{
  for (const {
    w: {
      keys
    } = {}
  } of [{
    w: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    ['w']: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  for (const _ref2 of [{
    [eff()]: Object
  }, {
    [eff()]: Object
  }]) {
    let {
        w: _ref
      } = _ref2,
      keys = _ref === Object ? _Object$keys : _keys(_ref);
    keys;
  }
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  for (const _ref3 of [{
    w: Array
  }]) {
    let {
      w: {
        keys
      }
    } = _ref3;
    keys;
  }
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }, {
    get w() {
      return {
        keys: _Object$keys
      };
    }
  }]) keys;
}
{
  for (const _ref5 of [{
    w: Object
  }, {
    v: Object
  }]) {
    let {
        w: _ref4
      } = _ref5,
      keys = _ref4 === Object ? _Object$keys : _keys(_ref4);
    keys;
  }
}
{
  for (const _ref7 of [{
    w: Object
  }, {
    w: Array
  }]) {
    let {
        w: _ref6
      } = _ref7,
      keys = _ref6 === Object ? _Object$keys : _keys(_ref6);
    keys;
  }
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }, {
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  for (const _ref9 of [{
    w: Object
  }, {
    w: Object,
    ...more
  }]) {
    let {
        w: _ref8
      } = _ref9,
      keys = _ref8 === Object ? _Object$keys : _keys(_ref8);
    keys;
  }
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }]) keys;
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    }
  }]) {
    const {
      w: {
        is
      }
    } = _x;
  }
}
{
  for (const {
    w: {
      keys
    }
  } of [{
    w: {
      keys: _Object$keys
    },
    z: 1
  }, {
    w: {
      keys: _Object$keys
    },
    z: 2
  }]) keys;
}
{
  for (const _ref13 of [{
    w: _globalThis.Object
  }]) {
    let keys = _Object$keys;
    keys;
  }
}
{
  for (const _ref10 of rows) {
    let keys = _keys(_ref10.w);
    keys;
  }
}
{
  for (const _ref11 of [{
    w: Object
  }, {
    w: Object
  }]) {
    let keys = _Object$keys;
    let {
      w: _unused,
      ...rest
    } = _ref11;
    keys;
  }
}
{
  for (const {
    w: {
      x: {
        entries
      }
    }
  } of [{
    w: {
      x: {
        entries: _Object$entries
      }
    }
  }]) entries;
}
{
  for (const {
    x
  } of [...[{
    x: [1]
  }], {
    x: [2]
  }]) _atMaybeArray(x).call(x, 0);
}
{
  for (let _ref12 = r, values = _values(_ref12.w), at = _at(_ref12.y);;) {
    [values, at];
    break;
  }
}
{
  for (var _r of [{
    w: Object
  }]) {
    let keys = _Object$keys;
    keys;
  }
}
{
  for (var {
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
  outer: for (const _r of [{
    w: Object
  }]) {
    let keys = _Object$keys;
    keys;
  }
}