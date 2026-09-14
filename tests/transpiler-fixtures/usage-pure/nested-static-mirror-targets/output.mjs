import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref5, _ref6;
// Identifier slots receive pure statics; a nested pattern under a static anchors on that static's
// ponyfill (its computed key runs there), while member assignment targets retain native slots.
// Computed keys and target effects stay live on both paths.
const events = [];
const pureFrom = _Array$from;
const box = {};
let from, bind;
let defaults = 0;
({
  Array: {
    [(_pushMaybeArray(events).call(events, 'first'), 'from')]: from
  }
} = {
  Array: {
    from: _Array$from
  }
});
({
  [(_pushMaybeArray(events).call(events, _atMaybeString(_ref = 'x').call(_ref, 0)), 'bind')]: bind
} = _Object$keys);
({
  Array: {
    [(_pushMaybeArray(events).call(events, 'second'), 'from')]: from
  },
  Object: {
    keys: box[_pushMaybeArray(events).call(events, _atMaybeString(_ref2 = 'y').call(_ref2, 0)), 'value']
  }
} = {
  Array: {
    from: _Array$from
  },
  Object: {
    keys: _globalThis.Object.keys
  }
});
({
  Array: {
    [(_pushMaybeArray(events).call(events, 'third'), 'from')]: from
  },
  Object: {
    keys: box[_pushMaybeArray(events).call(events, _atMaybeString(_ref3 = 'z').call(_ref3, 0)), 'value'] = (defaults++, null)
  }
} = {
  Array: {
    from: _Array$from
  },
  Object: {
    keys: _globalThis.Object.keys
  }
});
export const result = [from([7])[0], from === pureFrom, typeof bind, typeof box.value, defaults, events];
function observe() {
  try {
    _pushMaybeArray(events).call(events, typeof boundFrom);
  } catch (error) {
    _pushMaybeArray(events).call(events, _nameMaybeFunction(error));
  }
}
const _ref7 = _globalThis;
const _ref4 = _globalThis.Array;
const boundFrom = null == _ref4 ? _ref4[""] : (_pushMaybeArray(events).call(events, 'binding'), observe(), _Array$from);
const {
  keys: {
    [(_pushMaybeArray(events).call(events, _atMaybeString(_ref5 = 'a').call(_ref5, 0)), 'bind')]: boundBind
  }
} = _globalThis.Object;
function read({
  Array: {
    [(_pushMaybeArray(events).call(events, 'parameter'), 'from')]: method
  },
  Object: {
    keys: {
      [(_pushMaybeArray(events).call(events, _atMaybeString(_ref6 = 'b').call(_ref6, 0)), 'bind')]: bound
    }
  }
} = {
  Array: {
    from: _Array$from
  },
  Object: {
    keys: _Object$keys
  }
}) {
  return [method([8])[0], typeof bound];
}
export const bindings = [boundFrom([7])[0], typeof boundBind, read()];