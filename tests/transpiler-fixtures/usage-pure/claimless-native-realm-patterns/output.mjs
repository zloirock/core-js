import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
let realm, held;
export const stored = (realm = globalThis, held = realm.window.self)?.Number.MAX_SAFE_INTEGER.name;
export { held };
const {
  self: {
    [Symbol.iterator]: iterator
  }
} = globalThis;
const {
  self: {
    Set: {
      name: nativeName
    }
  }
} = globalThis;
const {
  self: {
    Set: {
      name
    },
    Map: {
      groupBy
    }
  }
} = {
  self: (_ref => {
    return _ref == null ? _ref : {
      Set: _ref.Set,
      Map: {
        groupBy: _Map$groupBy
      }
    };
  })(globalThis.self)
};
const {
  self: {
    [Symbol.iterator]: iter,
    Map: {
      groupBy: group
    }
  }
} = (_ref2 => {
  return {
    self: (_ref3 => {
      return _ref3 == null ? _ref3 : {
        get [Symbol.iterator]() {
          return _getIteratorMethod(_ref3);
        },
        Map: {
          groupBy: _Map$groupBy
        }
      };
    })(_ref2.self)
  };
})(globalThis);
export { iterator, nativeName, name, groupBy, iter, group };