import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Identifier targets receive pure statics, including leaves nested below another static.
// Member assignment targets keep native property reads and default behavior. Mixed hosts
// must preserve receiver reads and coercions, computed-key effects, and target evaluation
// in source order; binding and parameter patterns keep their initialization order.
const events = [];
const pureFrom = _Array$from;
const box = {};
let from, bind;
let defaults = 0;
({
  Array: {
    [(_pushMaybeArray(events).call(events, 'first'), 'from')]: from
  },
  Object: {
    keys: {
      [(_pushMaybeArray(events).call(events, _atMaybeString('x').call('x', 0)), 'bind')]: bind
    }
  }
} = {
  Array: {
    from: _Array$from
  },
  Object: {
    keys: _Object$keys
  }
});
({
  Array: {}
} = _globalThis), _pushMaybeArray(events).call(events, 'second'), from = _Array$from, {
  Object: {
    keys: box[_pushMaybeArray(events).call(events, _atMaybeString('y').call('y', 0)), 'value']
  }
} = _globalThis;
({
  Array: {}
} = _globalThis), _pushMaybeArray(events).call(events, 'third'), from = _Array$from, {
  Object: {
    keys: box[_pushMaybeArray(events).call(events, _atMaybeString('z').call('z', 0)), 'value'] = (defaults++, null)
  }
} = _globalThis;
export const result = [from([7])[0], from === pureFrom, typeof bind, typeof box.value, defaults, events];
function observe() {
  try {
    _pushMaybeArray(events).call(events, typeof boundFrom);
  } catch (error) {
    _pushMaybeArray(events).call(events, _nameMaybeFunction(error));
  }
}
const {
  Array: {
    [(_pushMaybeArray(events).call(events, 'binding'), observe(), 'from')]: boundFrom
  },
  Object: {
    keys: {
      [(_pushMaybeArray(events).call(events, _atMaybeString('a').call('a', 0)), 'bind')]: boundBind
    }
  }
} = {
  Array: {
    from: _Array$from
  },
  Object: {
    keys: _Object$keys
  }
};
function read({
  Array: {
    [(_pushMaybeArray(events).call(events, 'parameter'), 'from')]: method
  },
  Object: {
    keys: {
      [(_pushMaybeArray(events).call(events, _atMaybeString('b').call('b', 0)), 'bind')]: bound
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