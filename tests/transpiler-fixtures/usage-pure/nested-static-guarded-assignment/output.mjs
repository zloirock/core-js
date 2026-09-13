import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _self from "@core-js/pure/actual/self";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A nested static assignment keeps its guarded source check before key effects.
// If the source is absent, neither the key nor either target write is reached.
// The receiver prefix runs once; the next key observes the preceding target write.
const events = [];
let from = 'old-from';
let keys = 'old-keys';
let result;
try {
  var _ref;
  _pushMaybeArray(events).call(events, 'source');
  var _unused;
  ({
    Array: {
      [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from
    },
    [(_pushMaybeArray(events).call(events, _atMaybeString(_ref = 'x').call(_ref, 0), typeof from), 'Object')]: _unused
  } = ((null == _globalThis.window ? void 0 : _self).Array, {
    Array: {
      from: _Array$from
    },
    Object: _self.Object
  }));
  keys = _Object$keys;
  result = [from([7])[0], keys({
    x: 1
  })[0]];
} catch (error) {
  result = _nameMaybeFunction(error);
}
export { events, result };

// A native member target does not turn the preceding Identifier slot into a native-first default.
const pureFrom = _Array$from;
const box = {};
let method = 'old';
try {
  var _ref2;
  ({
    Array: {
      [(_pushMaybeArray(events).call(events, 'partial'), 'from')]: method
    },
    Object: {
      keys: box[_pushMaybeArray(events).call(events, method === pureFrom, _atMaybeString(_ref2 = 'y').call(_ref2, 0)), 'value']
    }
  } = (_pushMaybeArray(events).call(events, 'partial-source'), (null == _globalThis.window ? void 0 : _self).Array, {
    Array: {
      from: _Array$from
    },
    Object: {
      keys: _self.Object.keys
    }
  }));
} catch (error) {
  _pushMaybeArray(events).call(events, _nameMaybeFunction(error));
}
export const partial = [method === pureFrom, typeof box.value];