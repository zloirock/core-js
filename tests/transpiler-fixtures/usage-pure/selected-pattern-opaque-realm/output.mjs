import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A selected call can replace the initial realm with a user object.
// The visible realm arm cannot justify substituting the user's static method.
function read(flag, factory) {
  var _ref;
  let realm = _globalThis;
  ({
    value: realm
  } = flag ? {
    value: _globalThis
  } : factory());
  return [realm === _globalThis, (_ref = realm.Array, _ref === Array ? _Array$from([7]) : _ref.from([7]))[0]];
}
const factory = () => ({
  value: {
    Array: {
      from: () => [9]
    }
  }
});
export const result = [read(true, factory), read(false, factory)];